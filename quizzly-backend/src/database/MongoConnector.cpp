#include "database/MongoConnector.hpp"
#include <bsoncxx/json.hpp>
#include <bsoncxx/builder/stream/document.hpp>

using bsoncxx::builder::stream::document;
using bsoncxx::builder::stream::open_document;
using bsoncxx::builder::stream::close_document;
using bsoncxx::builder::stream::finalize;

MongoConnector::MongoConnector(const std::string& uri, const std::string& db_name)
    : client_{mongocxx::uri{uri}}, db_{client_[db_name]} {}

int MongoConnector::get_next_account_id() {
    auto counters = db_["counters"];
    auto result = counters.find_one_and_update(
        document{} << "_id" << "account_id" << finalize,
        document{} << "$inc" << open_document << "seq" << 1 << close_document << finalize
    );
    
    if(!result) {
        counters.insert_one(
            document{} << "_id" << "account_id" << "seq" << 1 << finalize
        );
        return 1;
    }
    return result->view()["seq"].get_int32().value;
}

bool MongoConnector::create_user(const std::string& username, 
                               const std::string& password,
                               const std::string& role) {
    auto users = db_["accounts"];
    
    // Check if user exists
    if(users.count_documents(document{} << "username" << username << finalize) > 0) {
        return false;
    }
    
    // Create user document
    auto doc = document{}
        << "account_id" << get_next_account_id()
        << "username" << username
        << "password" << password // In real app, store hashed password!
        << "role" << role
        << finalize;
        
    auto result = users.insert_one(doc.view());
    return result->result().inserted_count() == 1;
}