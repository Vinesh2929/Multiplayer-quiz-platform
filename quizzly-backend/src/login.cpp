#include "login.h"
#include <bsoncxx/json.hpp>
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <mongocxx/database.hpp>
#include <mongocxx/collection.hpp>
#include <bsoncxx/builder/stream/document.hpp>

bool loginUser(const std::string& body) {
    static mongocxx::instance instance{}; 
    mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/");
    mongocxx::client client(uri);

    auto db = client["Quiz_App_DB"];
    auto collection = db["accounts"];

    try {
        bsoncxx::document::value doc = bsoncxx::from_json(body);
        bsoncxx::document::view view = doc.view();

        std::string email = std::string(view["email"].get_string().value);
        std::string password = std::string(view["password"].get_string().value);

        bsoncxx::builder::stream::document filter_builder;
        filter_builder << "email" << email << "password" << password;

        auto maybe_result = collection.find_one(filter_builder.view());

        return maybe_result ? true : false;
    } catch (...) {
        return false;
    }
}
