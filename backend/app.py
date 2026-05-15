import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import io
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-123')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    expenses = db.relationship('Expense', backref='owner', lazy=True)
    budget = db.relationship('Budget', backref='owner', uselist=False)
    uploads = db.relationship('Upload', backref='owner', lazy=True)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(20), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    month = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Upload(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    upload_time = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    limit = db.Column(db.Float, default=0.0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Initialize Database
with app.app_context():
    db.create_all()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

# Helper to process data
def process_dataframe(df):
    summary = df.groupby('Category')['Amount'].sum().to_dict()
    monthly_summary = df.groupby('Month')['Amount'].sum().to_dict()
    transactions = df.to_dict(orient='records')
    insights = generate_insights(df)
    return {
        "transactions": transactions,
        "summary": summary,
        "monthly_summary": monthly_summary,
        "insights": insights
    }

# Auth Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    # Create default budget
    budget = Budget(limit=0.0, user_id=new_user.id)
    db.session.add(budget)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"token": access_token, "username": username}), 200

    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/budget', methods=['GET', 'POST'])
@jwt_required()
def handle_budget():
    user_id = get_jwt_identity()
    budget = Budget.query.filter_by(user_id=user_id).first()
    
    if request.method == 'POST':
        data = request.get_json()
        budget.limit = float(data.get('limit', 0))
        db.session.commit()
        return jsonify({"message": "Budget updated", "limit": budget.limit})
    
    return jsonify({"limit": budget.limit if budget else 0})

@app.route('/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(user_id=user_id).all()
    
    if not expenses:
        return jsonify({"transactions": [], "summary": {}, "monthly_summary": {}, "insights": "No data yet."})

    df = pd.DataFrame([{
        'Date': e.date,
        'Description': e.description,
        'Amount': e.amount,
        'Category': e.category,
        'Month': e.month
    } for e in expenses])
    
    return jsonify(process_dataframe(df))

@app.route('/subscriptions', methods=['GET'])
@jwt_required()
def get_subscriptions():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(user_id=user_id).all()
    
    if not expenses:
        return jsonify([])

    # Simple logic: group by description and count frequency
    df = pd.DataFrame([{'desc': e.description, 'amt': e.amount} for e in expenses])
    counts = df.groupby('desc').size()
    subs = counts[counts >= 2].index.tolist()
    
    result = []
    for s in subs:
        avg_amt = df[df['desc'] == s]['amt'].mean()
        result.append({"description": s, "amount": avg_amt})
        
    return jsonify(result)

def categorize_expenses(descriptions):
    if not os.getenv("OPENAI_API_KEY"):
        # Fallback dummy categorization if no API key is provided
        categories = []
        for desc in descriptions:
            desc_lower = desc.lower()
            if "coffee" in desc_lower or "mcdonalds" in desc_lower or "diner" in desc_lower:
                categories.append("Food")
            elif "uber" in desc_lower or "train" in desc_lower or "airlines" in desc_lower:
                categories.append("Travel")
            elif "amazon" in desc_lower or "apple" in desc_lower or "target" in desc_lower:
                categories.append("Shopping")
            elif "bill" in desc_lower:
                categories.append("Bills")
            elif "gym" in desc_lower or "netflix" in desc_lower:
                categories.append("Entertainment")
            else:
                categories.append("Other")
        return categories

    try:
        prompt = f"Categorize the following transaction descriptions into one of these categories: Food, Travel, Shopping, Bills, Entertainment, Other. Return only a comma-separated list of categories in the same order.\n\nDescriptions:\n{', '.join(descriptions)}"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that categorizes financial transactions."},
                {"role": "user", "content": prompt}
            ]
        )
        
        categories_str = response.choices[0].message.content.strip()
        categories = [cat.strip() for cat in categories_str.split(",")]
        return categories
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return ["Other"] * len(descriptions)

def generate_insights(df):
    if not os.getenv("OPENAI_API_KEY"):
        # Fallback dummy insights
        total = df['Amount'].sum()
        top_cat = df.groupby('Category')['Amount'].sum().idxmax()
        return f"Smart Insight: Your total spending is ${total:.2f}. Most of your money is going to {top_cat}. Try to reduce non-essential Shopping to save more!"

    try:
        summary = df.groupby(['Category'])['Amount'].sum().to_dict()
        prompt = f"Based on this spending summary, provide 2-3 short, smart financial insights (max 50 words total): {summary}"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial advisor giving quick spending tips."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return "Insight: Keep track of your daily expenses to better manage your budget!"

@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Read CSV
        df = pd.read_csv(io.StringIO(file.stream.read().decode("UTF8")))
        
        # Ensure required columns exist
        required_columns = ['Date', 'Description', 'Amount']
        if not all(col in df.columns for col in required_columns):
            return jsonify({"error": f"Missing columns. Required: {required_columns}"}), 400

        # Ensure Amount is numeric
        df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce').fillna(0)
        
        # Convert Date to datetime
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        df = df.dropna(subset=['Date'])
        df['Month'] = df['Date'].dt.strftime('%B %Y')

        # Get unique descriptions
        unique_descriptions = [d for d in df['Description'].unique().tolist() if pd.notna(d)]
        
        # Categorize
        cats = categorize_expenses(unique_descriptions)
        if len(cats) != len(unique_descriptions):
            cats = cats + ["Other"] * (len(unique_descriptions) - len(cats))
            
        category_map = dict(zip(unique_descriptions, cats))
        
        # Map categories
        df['Category'] = df['Description'].map(category_map).fillna("Other")
        
        # Save to Database
        for _, row in df.iterrows():
            expense = Expense(
                date=row['Date'].strftime('%Y-%m-%d'),
                description=row['Description'],
                amount=float(row['Amount']),
                category=row['Category'],
                month=row['Month'],
                user_id=user_id
            )
            db.session.add(expense)
        
        # Save Upload History
        new_upload = Upload(
            filename=file.filename,
            upload_time=datetime.now().strftime('%B %d, %Y at %I:%M %p'),
            user_id=user_id
        )
        db.session.add(new_upload)
        
        db.session.commit()
        
        # Prepare response
        df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')
        return jsonify(process_dataframe(df))

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
@jwt_required()
def get_upload_history():
    user_id = get_jwt_identity()
    uploads = Upload.query.filter_by(user_id=user_id).order_by(Upload.id.desc()).all()
    return jsonify([{
        "filename": u.filename,
        "upload_time": u.upload_time
    } for u in uploads])

if __name__ == '__main__':
    app.run(debug=True, port=5000)

