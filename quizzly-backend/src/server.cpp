#include "httplib.h"
#include <iostream>

int main() {
    httplib::Server svr;

    // Define an API route
    svr.Get("/api/data", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");  // CORS support
        res.set_content(R"({"message": "Hello from C++ Backend!"})", "application/json");
    });

    std::cout << "Server is running on http://localhost:5000\n";
    svr.listen("0.0.0.0", 5000);  // Run on port 5000
}
