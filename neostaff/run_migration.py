#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(__file__))
from migrate_db import migrate_database

if __name__ == "__main__":
    migrate_database()