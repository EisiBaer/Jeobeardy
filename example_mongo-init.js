db.createUser(
    {
            user: "database_user",
            pwd: "database_user_password",
            roles: [
                    {
                            role: "readWrite",
                            db: "jeobeardy"
                    }
            ]
    }
);