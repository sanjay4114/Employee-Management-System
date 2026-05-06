#!/usr/bin/env python3
"""
Verify MySQL connectivity and that ems_db tables exist.
Run from terminal (NOT from the browser):

    pip install pymysql
    python database/check_connection.py

Optional env vars: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
Default database name: ems_db
"""

from __future__ import annotations

import os
import sys


def main() -> int:
    try:
        import pymysql
    except ImportError:
        print("Install driver:  pip install pymysql")
        return 1

    host = os.environ.get("MYSQL_HOST", "127.0.0.1")
    port = int(os.environ.get("MYSQL_PORT", "3306"))
    user = os.environ.get("MYSQL_USER", "root")
    password = os.environ.get("MYSQL_PASSWORD", "")
    database = os.environ.get("MYSQL_DATABASE", "ems_db")

    print(f"Connecting to {user}@{host}:{port}/{database} ...")

    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            connect_timeout=10,
        )
    except pymysql.Error as e:
        print("Connection failed:", e)
        return 1

    print("OK — connected.\n")

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT TABLE_NAME, TABLE_ROWS
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = %s
            ORDER BY TABLE_NAME
            """,
            (database,),
        )
        rows = cur.fetchall()
        if not rows:
            print(f"No tables found in '{database}'. Run ems_schema.sql in Workbench first.")
        else:
            print("Tables:")
            for name, approx_rows in rows:
                print(f"  - {name}\t(~rows {approx_rows})")

        cur.execute("SELECT COUNT(*) FROM departments")
        print("\ndepartments row count:", cur.fetchone()[0])
        cur.execute("SELECT COUNT(*) FROM employees")
        print("employees row count:", cur.fetchone()[0])
        cur.execute("SELECT COUNT(*) FROM leaves")
        print("leaves row count:", cur.fetchone()[0])

    conn.close()
    print("\nDone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
