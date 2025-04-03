#include <iostream>
#include "httplib.h"
#include "createQuiz.h"
#include "register.h"
#include "editQuiz.h"
#include "login.h"
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/oid.hpp>
#include "getQuizzes.h"


#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>

int main() {
    httplib::Server svr;

    // Set CORS headers
    svr.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Methods", "GET, POST, OPTIONS"},
        {"Access-Control-Allow-Headers", "Content-Type"}
    });

    // Handle OPTIONS requests
    svr.Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 200;
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

    // GET endpoint to fetch quiz data (called when a user wants to edit a quiz)
    svr.Get(R"(/api/quiz/(\w+))", [](const httplib::Request &req, httplib::Response &res) {
        std::string quizId = req.matches[1];  // captured group from regex
        try {
            static mongocxx::instance instance{};
            mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/");
            mongocxx::client client(uri);
            auto db = client["Quiz_App_DB"];
            auto collection = db["Quizzes"];

            bsoncxx::oid quizOid(quizId);
            auto result = collection.find_one(bsoncxx::builder::stream::document{}
                << "_id" << quizOid
                << bsoncxx::builder::stream::finalize);

            if (result) {
                std::string jsonStr = bsoncxx::to_json(result->view());
                res.set_content(R"({"success": true, "quiz": )" + jsonStr + "}", "application/json");
            } else {
                res.set_content(R"({"success": false, "error": "Quiz not found"})", "application/json");
            }
        } catch (const std::exception &e) {
            res.set_content(std::string(R"({"success": false, "error": ")") + e.what() + R"("})", "application/json");
        }
    });

    // PUT endpoint to edit fields in a Quizzes table entry 
    svr.Put("/api/edit-quiz", [](const httplib::Request &req, httplib::Response &res) {
    // User login endpoint
    svr.Post("/api/login", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        bool success = updateQuiz(req.body);
        std::string jsonResponse = success 
            ? R"({"success": true})" 
            : R"({"success": false, "error": "Failed to update quiz"})";
        res.set_content(jsonResponse, "application/json");
    });

    std::cout << "Server is running on http://localhost:5001\n";
    svr.listen("0.0.0.0", 5001);
}
