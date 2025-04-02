#include <iostream>
#include "httplib.h"
#include "createQuiz.h"

int main() {
    httplib::Server svr;

    // Set CORS headers only once (remove from set_default_headers)
    svr.set_default_headers({
        {"Access-Control-Allow-Methods", "GET, POST, OPTIONS"},
        {"Access-Control-Allow-Headers", "Content-Type"}
    });

    // Handle OPTIONS requests
    svr.Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        return 200;
    });

    // Add CORS header to each endpoint individually
    svr.Get("/api/data", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content(R"({"message": "Hello from C++ Backend!"})", "application/json");
    });

    svr.Post("/api/create-quiz", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        bool success = createQuiz(req.body);
        std::string jsonResponse = success 
            ? R"({"success": true})" 
            : R"({"success": false, "error": "Failed to create quiz"})";
        
        res.set_content(jsonResponse, "application/json");
    });

    std::cout << "Server is running on http://localhost:5000\n";
    svr.listen("0.0.0.0", 5000);
}