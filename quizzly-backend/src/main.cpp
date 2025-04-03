#include <iostream>
#include "httplib.h"
#include "createQuiz.h"
#include "register.h"
#include "editQuiz.h"
#include "login.h"
#include "getQuizzes.h"
#include "mongo_instance.h"

#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/oid.hpp>

mongocxx::instance instance{};
int main()
{
    

    httplib::Server svr;

    // Set CORS headers
    svr.set_default_headers({{"Access-Control-Allow-Origin", "*"},
                             {"Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS"},
                             {"Access-Control-Allow-Headers", "Content-Type"}});

    // Handle OPTIONS requests
    svr.Options(R"(.*)", [](const httplib::Request &, httplib::Response &res)
                { res.status = 200; });

    // Test endpoint
    svr.Get("/api/data", [](const httplib::Request &, httplib::Response &res)
            { res.set_content(R"({"message": "Hello from C++ Backend!"})", "application/json"); });

    // Get all quizzes endpoint
    svr.Get("/api/quizzes", [](const httplib::Request &, httplib::Response &res)
            {
        std::string quizzes = getAllQuizzes();
        res.set_content(quizzes, "application/json"); });

    // Create quiz endpoint
    svr.Post("/api/create-quiz", [](const httplib::Request &req, httplib::Response &res)
             {
        
        bool success = createQuiz(req.body);
        std::string jsonResponse = success 
            ? R"({"success": true})" 
            : R"({"success": false, "error": "Failed to create quiz"})";
        
        res.set_content(jsonResponse, "application/json"); });

    // User registration endpoint
    svr.Post("/api/register", [](const httplib::Request &req, httplib::Response &res)
             {
        
        bool success = registerUser(req.body);
        std::string jsonResponse = success 
            ? R"({"success": true})" 
            : R"({"success": false, "error": "Failed to register user"})";
        
        res.set_content(jsonResponse, "application/json"); });

    // GET quiz by title
    // GET quiz by ID (instead of by title)
    svr.Get(R"(/api/quiz/id/([a-f0-9]{24}))", [](const httplib::Request &req, httplib::Response &res)
            {
            std::string quizId = req.matches[1];
            try {
            mongocxx::uri uri("mongodb+srv://ngelbloo:jxdnXevSBkquhl2E@se3313-cluster.7kcvssw.mongodb.net/");
            mongocxx::client client(uri);
            auto db = client["Quiz_App_DB"];
            auto collection = db["Quizzes"];

    // Convert string ID to MongoDB ObjectId
            bsoncxx::oid oid(quizId);
            auto result = collection.find_one(
            bsoncxx::builder::stream::document{} << "_id" << oid << bsoncxx::builder::stream::finalize
            );

            if (result) {
                std::string jsonStr = bsoncxx::to_json(result->view());
                res.set_content(R"({"success": true, "quiz": )" + jsonStr + "}", "application/json");
            } else {
                res.set_content(R"({"success": false, "error": "Quiz not found"})", "application/json");
            }
             } catch (const std::exception &e) {
            res.set_content(std::string(R"({"success": false, "error": ")") + e.what() + R"("})", "application/json");
             } });

    // PUT endpoint to edit fields in a Quizzes table entry
    svr.Put("/api/edit-quiz", [](const httplib::Request &req, httplib::Response &res) {
        try {
            // Parse the incoming JSON using bsoncxx
            auto doc = bsoncxx::from_json(req.body);
            auto view = doc.view();
            
            // Check for either "id" or "_id" field
            if (!view["id"] && !view["_id"]) {
                res.set_content(
                    R"({"success": false, "error": "Missing quiz ID in request body"})", 
                    "application/json"
                );
                return;
            }
    
            // Update the quiz using the ID
            bool success = updateQuiz(req.body);
            
            std::string jsonResponse = success 
                ? R"({"success": true})" 
                : R"({"success": false, "error": "Failed to update quiz. Quiz may not exist or no changes were made."})";
            
            res.set_content(jsonResponse, "application/json");
        } catch (const std::exception &e) {
            res.set_content(
                std::string(R"({"success": false, "error": ")") + e.what() + R"("})",
                "application/json"
            );
            res.status = 400; // Bad Request
        }
    });

    // User login endpoint
    svr.Post("/api/login", [](const httplib::Request &req, httplib::Response &res)
             {
        bool success = loginUser(req.body);
        std::string jsonResponse = success 
            ? R"({"success": true})" 
            : R"({"success": false, "error": "Failed to login"})";
        res.set_content(jsonResponse, "application/json"); });

    std::cout << "Server is running on http://localhost:5001\n";
    svr.listen("0.0.0.0", 5001);
    return 0;
}
