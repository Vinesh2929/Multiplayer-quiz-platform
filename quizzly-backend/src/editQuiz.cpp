#include <iostream>
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include "editQuiz.h"
#include "mongo_instance.h"

bool updateQuiz(const std::string &jsonString) {
    try {
        // Initialize MongoDB connection
        mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/"
                             "?retryWrites=true&w=majority"
                             "&connectTimeoutMS=10000"
                             "&socketTimeoutMS=10000"
                             "&serverSelectionTimeoutMS=10000");
        mongocxx::client client(uri);
        auto db = client["Quiz_App_DB"];
        auto collection = db["Quizzes"];

        // Parse the incoming JSON string
        auto quizDoc = bsoncxx::from_json(jsonString);
        auto view = quizDoc.view();

        // Expect the document to contain the quiz's ID
        if (!view["id"] && !view["_id"]) {
            std::cerr << "Missing ID field in update payload" << std::endl;
            return false;
        }

        // Get the ID (handling both "id" and "_id" fields)
        bsoncxx::oid quizId;
        if (view["id"]) {
            quizId = bsoncxx::oid(view["id"].get_string().value);
        } else if (view["_id"]) {
            if (view["_id"].type() == bsoncxx::type::k_oid) {
                quizId = view["_id"].get_oid().value;
            } else {
                quizId = bsoncxx::oid(view["_id"].get_string().value);
            }
        }

        std::cout << "Updating quiz with ID: " << quizId.to_string() << std::endl;

        // Filter by ID
        auto filter = bsoncxx::builder::stream::document{}
                    << "_id" << quizId
                    << bsoncxx::builder::stream::finalize;

        // Build the update document using the $set operator
        auto updateBuilder = bsoncxx::builder::stream::document{};
        updateBuilder << "$set" << bsoncxx::builder::stream::open_document;
        
        // Update all fields except the ID fields
        for (auto &&element : view) {
            std::string key = std::string(element.key());
            if (key == "id" || key == "_id") continue;
            updateBuilder << key << element.get_value();
        }
        updateBuilder << bsoncxx::builder::stream::close_document;

        // Perform the update
        auto updateResult = collection.update_one(filter.view(), updateBuilder.view());
        
        if (updateResult) {
            if (updateResult->modified_count() > 0) {
                std::cout << "Successfully updated quiz with ID: " << quizId.to_string() << std::endl;
                return true;
            } else {
                std::cout << "No documents were modified (ID might not exist or no changes were made)" << std::endl;
            }
        }
        return false;
    } catch (const std::exception &e) {
        std::cerr << "MongoDB Update Error: " << e.what() << std::endl;
        return false;
    }
}