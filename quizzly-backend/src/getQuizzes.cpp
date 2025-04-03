#include "getQuizzes.h"
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <iostream>
#include <chrono>

// Global instance (same as createQuiz)


std::string getAllQuizzes() {
    try {
        // Configure connection URI with timeout options
        std::string uri_str = "mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/"
                             "?retryWrites=true&w=majority"
                             "&connectTimeoutMS=5000"
                             "&socketTimeoutMS=5000"
                             "&serverSelectionTimeoutMS=5000";
        
        mongocxx::uri uri(uri_str);

        // Create client
        mongocxx::client client(uri);

        // Get collection
        auto collection = client["Quiz_App_DB"]["Quizzes"];

        // Build JSON response
        bsoncxx::builder::stream::document builder;
        auto array = builder << "quizzes" << bsoncxx::builder::stream::open_array;

        // Set find options with timeout
        mongocxx::options::find find_opts{};
        find_opts.max_time(std::chrono::milliseconds(3000));

        auto cursor = collection.find({}, find_opts);
        for (auto&& doc : cursor) {
            try {
                array << bsoncxx::types::b_document{doc};
            } catch (const std::exception& e) {
                std::cerr << "Error processing document: " << e.what() << std::endl;
                continue;
            }
        }

        array << bsoncxx::builder::stream::close_array;
        return bsoncxx::to_json(builder.view());

    } catch (const std::exception &e) {
        std::cerr << "MongoDB Error: " << e.what() << std::endl;
        return R"({"error": "Failed to retrieve quizzes"})";
    }
}