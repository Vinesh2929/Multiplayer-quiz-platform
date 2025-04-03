#include <iostream>
#include <mongocxx/client.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include <vector>
#include <ctime>
#include <random>
#include "register.h"

// Wrap the libbcrypt header fors C++ usage
extern "C"
{
#include "../external/libbcrypt/include/bcrypt/bcrypt.h"
}

int generateAccountId()
{
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> distrib(100000, 999999);
    return distrib(gen);
}

bool registerUser(const std::string &jsonString)
{
    try
    {
        mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/");
        mongocxx::client client(uri);
        auto db = client["Quiz_App_DB"];
        auto collection = db["accounts"];

        // Parse the JSON
        auto userDoc = bsoncxx::from_json(jsonString);
        auto view = userDoc.view();

        // Convert bsoncxx string_view -> std::string
        std::string name(view["name"].get_string().value.data(),
                         view["name"].get_string().value.size());
        std::string email(view["email"].get_string().value.data(),
                          view["email"].get_string().value.size());
        std::string plaintextPassword(view["password"].get_string().value.data(),
                                      view["password"].get_string().value.size());

        std::cout << "Received registration data:\n";
        std::cout << "Name: " << name << "\n";
        std::cout << "Email: " << email << "\n";
        std::cout << "Password (plaintext): " << plaintextPassword << "\n";

        // Check if user already exists
        auto result = collection.find_one(bsoncxx::builder::stream::document{}
                                          << "email" << email
                                          << bsoncxx::builder::stream::finalize);

        if (result)
        {
            std::cerr << "User already exists with this email\n";
            return false;
        }

        // Generate salt and hash password using libbcrypt
        char salt[BCRYPT_HASHSIZE];
        char hash_output[BCRYPT_HASHSIZE];

        // e.g. cost factor 12
        if (bcrypt_gensalt(12, salt) != 0)
        {
            std::cerr << "Error generating salt\n";
            return false;
        }

        if (bcrypt_hashpw(plaintextPassword.c_str(), salt, hash_output) != 0)
        {
            std::cerr << "Error hashing password\n";
            return false;
        }

        std::string hashedPassword(hash_output);
        std::cout << "Hashed Password: " << hashedPassword << "\n";

        // Build the new user document with hashed password
        auto builder = bsoncxx::builder::stream::document{};
        bsoncxx::document::value newUser = builder
                                           << "account_id" << generateAccountId()
                                           << "username" << name
                                           << "email" << email
                                           << "password" << hashedPassword
                                           << "role" << "user"
                                           << "created_at" << bsoncxx::types::b_date{std::chrono::system_clock::now()}
                                           << bsoncxx::builder::stream::finalize;

        auto insert_result = collection.insert_one(newUser.view());
        if (!insert_result)
        {
            std::cerr << "Insert operation failed.\n";
            return false;
        }
        return true;
    }
    catch (const std::exception &e)
    {
        std::cerr << "MongoDB Error: " << e.what() << "\n";
        return false;
    }
}