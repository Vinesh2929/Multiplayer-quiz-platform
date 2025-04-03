#include <iostream>
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include "editQuiz.h"
#include "mongo_instance.h"

bool updateQuiz(const std::string &jsonString)
{
    try
    {
        // Initialize MongoDB (use a static instance so it's only created once)
        //static mongocxx::instance instance{};
        mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/");
        mongocxx::client client(uri);

        auto db = client["Quiz_App_DB"];
        auto collection = db["Quizzes"];

        // Parse the incoming JSON string
        auto quizDoc = bsoncxx::from_json(jsonString);
        auto view = quizDoc.view();

        // Expect the document to contain the quiz's title as a string, update the entry in the Quizzes table with that title
        if (!view["title"])
        {
            std::cerr << "Missing title field in update payload" << std::endl;
            return false;
        }
        std::string quizTitle = std::string(view["title"].get_string().value);
        std::cout << "Updating entry in table Quizzes where title is " << quizTitle << std::endl;

        // Filter by title
        auto filter = bsoncxx::builder::stream::document{}
                      << "title" << quizTitle
                      << bsoncxx::builder::stream::finalize;

        // Build the update document using the $set operator.
        // (Assume every field except title should be updated.)
        auto updateBuilder = bsoncxx::builder::stream::document{};
        updateBuilder << "$set" << bsoncxx::builder::stream::open_document;
        for (auto &&element : view)
        {
            std::string key = std::string(element.key());
            if (key == "title" || key == "quiz_id" || key == "_id")
                continue;
            updateBuilder << key << element.get_value();
        }
        updateBuilder << bsoncxx::builder::stream::close_document;

        auto updateResult = collection.update_one(filter.view(), updateBuilder.view());
        if (updateResult && updateResult->modified_count() > 0)
        {
            return true;
        }
        return false;
    }
    catch (const std::exception &e)
    {
        std::cerr << "MongoDB Update Error: " << e.what() << std::endl;
        return false;
    }
}