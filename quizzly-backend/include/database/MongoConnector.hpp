#pragma once
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <string>

class MongoConnector {
public:
    MongoConnector(const std::string& uri, const std::string& db_name);
    
    // User operations
    bool create_user(const std::string& username, const std::string& password, const std::string& role);
    bool authenticate_user(const std::string& username, const std::string& password);
    
    // Quiz operations
    std::string create_quiz(const std::string& creator, const std::string& title);
    
private:
    mongocxx::instance instance_; // Must be initialized once
    mongocxx::client client_;
    mongocxx::database db_;
    
    int get_next_account_id();
};