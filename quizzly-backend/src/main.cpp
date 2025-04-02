#include <iostream>
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <mongocxx/exception/exception.hpp>
#include <mongocxx/options/client.hpp>
#include <mongocxx/options/server_api.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/types.hpp>
#include "httplib.h"

int main() {
    httplib::Server svr;

    // Define an API route
    svr.Get("/api/data", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");  // CORS support
        res.set_content(R"({"message": "Hello from C++ Backend!"})", "application/json");
    });

    std::cout << "Server is running on http://localhost:5000\n";
    svr.listen("0.0.0.0", 5000);  // Run on port 5000
    try {
        // 1. Initialize MongoDB driver
        mongocxx::instance instance{};
        
        // 2. Configure connection
        std::cout << "Attempting to connect to MongoDB Atlas..." << std::endl;
        mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/"
                        "?retryWrites=true&w=majority"
                        "&connectTimeoutMS=10000"
                        "&socketTimeoutMS=10000"
                        "&serverSelectionTimeoutMS=30000");
        
        // 3. Create client with explicit options
        mongocxx::options::client client_options;
        auto api = mongocxx::options::server_api{mongocxx::options::server_api::version::k_version_1};
        client_options.server_api_opts(api);
        
        mongocxx::client client(uri, client_options);
        
        // 4. Test connection
        auto db = client["admin"];
        auto ping_cmd = bsoncxx::builder::stream::document{} 
            << "ping" << 1 
            << bsoncxx::builder::stream::finalize;
        
        std::cout << "Sending ping command..." << std::endl;
        auto result = db.run_command(ping_cmd.view());
        
        // 5. Handle response
        if (auto ok_elem = result.view()["ok"]) {
            if (ok_elem.type() == bsoncxx::type::k_double || 
                ok_elem.type() == bsoncxx::type::k_int32) {
                std::cout << "\033[32mSuccess! Response:\033[0m\n" 
                          << bsoncxx::to_json(result.view()) << std::endl;
                return 0;
            }
        }
        
        std::cerr << "\033[31mUnexpected response format\033[0m" << std::endl;
        return 1;
        
    } catch (const mongocxx::exception &e) {
        std::cerr << "\033[31mMongoDB Error: " << e.what() << "\033[0m" << std::endl;
        return 1;
    } catch (const std::exception &e) {
        std::cerr << "\033[31mError: " << e.what() << "\033[0m" << std::endl;
        return 2;
    }
}