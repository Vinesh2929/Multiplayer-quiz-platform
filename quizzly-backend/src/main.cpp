#include <iostream>
#include "httplib.h"
#include "createQuiz.h"
#include "register.h"
#include "login.h"
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/oid.hpp>
#include "getQuizzes.h"


int main() {
    mongocxx::instance instance{};
    httplib::Server svr;

    // Set CORS headers
    svr.set_default_headers({
        {"Access-Control-Allow-Methods", "GET, POST, OPTIONS"},
        {"Access-Control-Allow-Headers", "Content-Type"}
    });

    // Handle OPTIONS requests
    svr.Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        return 200;
    });

    // Test endpoint
    svr.Get("/api/data", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content(R"({"message": "Hello from C++ Backend!"})", "application/json");
    });

    // Get all quizzes endpoint
    svr.Get("/api/quizzes", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string quizzes = getAllQuizzes();
        res.set_content(quizzes, "application/json");
    });

    // Create quiz endpoint
    svr.Post("/api/create-quiz", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        bool success = createQuiz(req.body);
        std::string jsonResponse = success 
            ? R"({"success": true})" 
            : R"({"success": false, "error": "Failed to create quiz"})";
        
        res.set_content(jsonResponse, "application/json");
    });

    // User registration endpoint
    svr.Post("/api/register", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        bool success = registerUser(req.body);
        std::string jsonResponse = success 
            ? R"({"success": true})" 
            : R"({"success": false, "error": "Failed to register user"})";
        
        res.set_content(jsonResponse, "application/json");
    });

    // User login endpoint
    svr.Post("/api/login", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
    
        bool success = loginUser(req.body);
        std::string jsonResponse = success 
            ? R"({"success": true})"
            : R"({"success": false, "error": "Invalid credentials"})";
    
        res.set_content(jsonResponse, "application/json");
    });

    std::cout << "Server is running on http://localhost:5001\n";
    svr.listen("0.0.0.0", 5001);
}