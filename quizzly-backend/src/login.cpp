#include "login.h"
#include <bsoncxx/json.hpp>
#include <mongocxx/client.hpp>
#include <mongocxx/uri.hpp>
#include <mongocxx/database.hpp>
#include <mongocxx/collection.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <iostream>

extern "C" {
  #include "../external/libbcrypt/include/bcrypt/bcrypt.h"
}

bool loginUser(const std::string& body) {
    try {
        mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/");
        mongocxx::client client(uri);
        auto db = client["Quiz_App_DB"];
        auto collection = db["accounts"];

        // Parse the login JSON
        bsoncxx::document::value doc = bsoncxx::from_json(body);
        auto view = doc.view();

        std::string email(view["email"].get_string().value.data(),
                          view["email"].get_string().value.size());
        std::string plaintextPassword(view["password"].get_string().value.data(),
                                      view["password"].get_string().value.size());

        // Find user by email
        bsoncxx::builder::stream::document filter_builder;
        filter_builder << "email" << email;
        auto maybe_result = collection.find_one(filter_builder.view());

        if (!maybe_result) {
            std::cerr << "User not found\n";
            return false;
        }

        // Get stored hashed password
        auto userView = maybe_result->view();
        std::string storedHash(userView["password"].get_string().value.data(),
                               userView["password"].get_string().value.size());

        // Compare plaintext password with stored hash
        // bcrypt_checkpw returns 0 on success (match)
        if (bcrypt_checkpw(plaintextPassword.c_str(), storedHash.c_str()) == 0) {
            std::cout << "Password validation succeeded\n";
            return true;
        } else {
            std::cerr << "Password validation failed\n";
            return false;
        }
    } catch (const std::exception &e) {
        std::cerr << "Login Error: " << e.what() << "\n";
        return false;
    }
}