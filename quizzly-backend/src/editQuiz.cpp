#include <iostream>
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include "editQuiz.h"

bool updateQuiz(const std::string &jsonString) {
    try {
        // Initialize MongoDB (use a static instance so it's only created once)
        static mongocxx::instance instance{}; 
        mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/");
        mongocxx::client client(uri);

        auto db = client["Quiz_App_DB"];
        auto collection = db["Quizzes"];

        // Parse the incoming JSON string
        auto quizDoc = bsoncxx::from_json(jsonString);
        auto view = quizDoc.view();

        // Expect the document to contain the quiz's _id (as a string, e.g., quiz_id)
        if (!view["quiz_id"]) {
            std::cerr << "Missing quiz_id field in update payload" << std::endl;
            return false;
        }
        std::string quizIdStr = std::string(view["quiz_id"].get_string().value);
        bsoncxx::oid quizOid(quizIdStr);

        // Build the filter using the _id
        auto filter = bsoncxx::builder::stream::document{} 
            << "_id" << quizOid 
            << bsoncxx::builder::stream::finalize;

        // Build the update document using the $set operator.
        // (Assume every field except quiz_id should be updated.)
        auto updateBuilder = bsoncxx::builder::stream::document{};
        updateBuilder << "$set" << bsoncxx::builder::stream::open_document;
        for (auto&& element : view) {
            std::string key = std::string(element.key());
            if (key == "quiz_id" || key == "_id") continue;
            updateBuilder << key << element.get_value();
        }
        updateBuilder << bsoncxx::builder::stream::close_document;

        auto updateResult = collection.update_one(filter.view(), updateBuilder.view());
        if (updateResult && updateResult->modified_count() > 0) {
            return true;
        }
        return false;

    } catch (const std::exception &e) {
        std::cerr << "MongoDB Update Error: " << e.what() << std::endl;
        return false;
    }
}