#include "login.h"
#include <bsoncxx/json.hpp>
#include <mongocxx/client.hpp>
#include <mongocxx/uri.hpp>
#include <mongocxx/database.hpp>
#include <mongocxx/collection.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <iostream>
#include <iomanip>
#include <algorithm>  // For std::all_of

extern "C" {
  #include "../external/libbcrypt/include/bcrypt/bcrypt.h"
}

// Sanitize string by removing non-printable characters
std::string sanitize(const std::string& str) {
    std::string sanitized;
    for (char c : str) {
        if (std::isprint(static_cast<unsigned char>(c))) {
            sanitized += c;
        }
    }
    return sanitized;
}

// Verify null-terminated strings for bcrypt
bool is_valid_c_string(const std::string& str) {
    return std::all_of(str.begin(), str.end(), [](char c) {
        return c != '\0';
    }) && !str.empty();
}

bool loginUser(const std::string& body) {
    try {
        mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/"
                             "?retryWrites=true&w=majority"
                             "&connectTimeoutMS=10000"
                             "&socketTimeoutMS=10000"
                             "&serverSelectionTimeoutMS=10000");
        mongocxx::client client(uri);
        auto db = client["Quiz_App_DB"];
        auto collection = db["accounts"];

        // Parse JSON input
        auto doc = bsoncxx::from_json(body);
        auto view = doc.view();

        // Sanitize and validate email
        std::string email = sanitize(std::string(view["email"].get_string().value));
        if (email.empty()) {
            std::cerr << "[ERROR] Empty email after sanitization\n";
            return false;
        }

        // Sanitize and validate password
        std::string plaintextPassword = sanitize(std::string(view["password"].get_string().value));
        if (!is_valid_c_string(plaintextPassword)) {
            std::cerr << "[ERROR] Invalid characters in password\n";
            return false;
        }

        std::cout << "[LOGIN ATTEMPT] Email: " << email << "\n";
        std::cout << "[LOGIN ATTEMPT] Password: " << plaintextPassword << "\n";

        // Build query
        auto filter = bsoncxx::builder::stream::document{}
            << "email" << email
            << bsoncxx::builder::stream::finalize;
        auto maybe_result = collection.find_one(filter.view());

        if (!maybe_result) {
            std::cerr << "[ERROR] User not found for email: " << email << "\n";
            return false;
        }

        // Process user document
        auto userView = maybe_result->view();
        std::cout << "[INFO] User found: " << bsoncxx::to_json(userView) << "\n";

        // Extract and validate password hash
        auto passwordValue = userView["password"];
        if (passwordValue.type() != bsoncxx::type::k_string) {
            std::cerr << "[ERROR] Password field has invalid type\n";
            return false;
        }

        std::string storedHash = sanitize(std::string(passwordValue.get_string().value));
        
        // Workaround for bcrypt_checkpw issues
        char computed_hash[BCRYPT_HASHSIZE];
        int hash_result = bcrypt_hashpw(plaintextPassword.c_str(), storedHash.c_str(), computed_hash);
        
        if (hash_result != 0) {
            std::cerr << "[ERROR] bcrypt_hashpw failed\n";
            return false;
        }

        // Compare computed hash with stored hash
        bool match = (storedHash == computed_hash);
        std::cout << "[DEBUG] Hash match: " << std::boolalpha << match << "\n";

        return match;

    } catch (const std::exception &e) {
        std::cerr << "[EXCEPTION] Login Error: " << e.what() << "\n";
        return false;
    }
}