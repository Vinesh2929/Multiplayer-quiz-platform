// registerUser.cpp
#include <iostream>
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include <vector>
#include <ctime>
#include <random>
#include "register.h"

// Function to generate a random account ID
int generateAccountId() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> distrib(100000, 999999);
    return distrib(gen);
}

// Function to register a new user
bool registerUser(const std::string &jsonString) {
    try {
        mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/");
        mongocxx::client client(uri);

        auto db = client["Quiz_App_DB"];
        auto collection = db["accounts"];

        auto userDoc = bsoncxx::from_json(jsonString);
        auto view = userDoc.view();

        std::cout << "Received registration data:" << std::endl;
        std::cout << "Name: " << view["name"].get_string().value << std::endl;
        std::cout << "Email: " << view["email"].get_string().value << std::endl;
        std::cout << "Password: " << view["password"].get_string().value << std::endl;

        auto result = collection.find_one(bsoncxx::builder::stream::document{}
            << "email" << view["email"].get_string().value
            << bsoncxx::builder::stream::finalize);

        if (result) {
            std::cerr << "User already exists with this email" << std::endl;
            return false;
        }

        auto builder = bsoncxx::builder::stream::document{};
        bsoncxx::document::value newUser = builder
            << "account_id" << generateAccountId()
            << "username" << view["name"].get_string().value
            << "email" << view["email"].get_string().value
            << "password" << view["password"].get_string().value
            << "role" << "user"
            << "created_at" << bsoncxx::types::b_date{std::chrono::system_clock::now()}
            << bsoncxx::builder::stream::finalize;

        auto insert_result = collection.insert_one(newUser.view());
        if (!insert_result) {
            std::cerr << "Insert operation failed." << std::endl;
        }
        return insert_result ? true : false;

    } catch (const std::exception &e) {
        std::cerr << "MongoDB Error: " << e.what() << std::endl;
        return false;
    }
}
