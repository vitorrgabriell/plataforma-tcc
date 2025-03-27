# test_env.py
from dotenv import load_dotenv
import os

load_dotenv()

print("DATABASE_URL:")
print(repr(os.getenv("DATABASE_URL")))
