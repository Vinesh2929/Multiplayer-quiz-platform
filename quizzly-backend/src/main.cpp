#include "database/MongoConnector.hpp"
#include "server/HttpServer.hpp"
#include <boost/asio/io_context.hpp>
#include <iostream>

int main() {
    try {
        // Configuration
        const std::string mongo_uri = "mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/?retryWrites=true&w=majority&appName=SE3313-Cluster";
        const std::string db_name = "quizzly";
        const std::string bind_address = "0.0.0.0";
        const unsigned short port = 8080;

        // Initialize MongoDB
        MongoConnector mongo(mongo_uri, db_name);
        
        // Create test user
        mongo.create_user("admin", "admin123", "admin");

        // Start HTTP Server
        net::io_context ioc;
        HttpServer server(ioc, bind_address, port);
        server.start();

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}