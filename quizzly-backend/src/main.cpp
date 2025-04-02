#include <iostream>
#include "httplib.h"
#include "createQuiz.cpp"  // Include the createQuiz function

int main() {
    httplib::Server svr;

    // Handle POST request to create a quiz
    svr.Post("/api/create-quiz", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");  // Allow CORS
        res.set_header("Content-Type", "application/json");

        // Check if request body is empty
        if (req.body.empty()) {
            res.status = 400;
            res.set_content(R"({"status": "error", "message": "Empty request body"})", "application/json");
            return;
        }

        // Call createQuiz function with request JSON body
        if (createQuiz(req.body)) {
            res.status = 200;
            res.set_content(R"({"status": "success", "message": "Quiz created successfully"})", "application/json");
        } else {
            res.status = 500;
            res.set_content(R"({"status": "error", "message": "Failed to create quiz"})", "application/json");
        }
    });

    // Sample GET request for testing
    svr.Get("/api/data", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content(R"({"message": "Hello from C++ Backend!"})", "application/json");
    });

    std::cout << "Server is running on http://localhost:5000\n";
    svr.listen("0.0.0.0", 5000);
}
