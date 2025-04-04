#include <iostream>
#include <unistd.h> // For fork()
#include <thread>   // For std::thread
#include <vector>   // For std::vector
#include <mutex>    // For std::mutex
#include <cstdlib>  // For srand(), rand()
#include <ctime>    // For time()

// header files
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
#include <unordered_map>
#include <string>
#include <sys/types.h>

// structure to store information about an active game session (each active session is a process and has unique pID)
struct GameSessionInfo
{
    pid_t pid;
};

// Global map and mutex to store active game sessions
std::unordered_map<std::string, GameSessionInfo> activeGames;
std::mutex activeGamesMutex;

// helper function to generate a 6-digit game code
std::string generateGameCode()
{
    // Use current time as seed (for simplicity; in production, improve uniqueness)
    // srand(time(NULL)); // move to main method
    int code = 100000 + rand() % 900000;
    return std::to_string(code);
}

// helper function to check if the game code generated is already in use
std::string generateUniqueGameCode()
{
    std::string code;
    while (true)
    {
        code = generateGameCode(); // generates a code
        {
            std::lock_guard<std::mutex> lock(activeGamesMutex);

            // checks if the code is already in use
            if (activeGames.find(code) == activeGames.end())
            {
                break;
            }
        }
    }
    return code; // returns a unique game code
}

// for testing, replace with dynamic behavior
void runGameSession(const std::string &gameCode)
{
    // print statement for debugging
    std::cout << "Game session started for game code " << gameCode
              << " in child process " << getpid() << "\n";

    // Simulate a lobby period, when other users will join
    // can remove ability to start game in frontend, this will be handled here
    std::this_thread::sleep_for(std::chrono::seconds(30));

    // Simulate starting the game by creating threads for each joined player

    // SAMPLE DATA - will remove and replace with logic for multithreading

    int simulatedPlayers = 3;
    std::vector<std::thread> playerThreads;
    for (int i = 0; i < simulatedPlayers; i++)
    {
        // add players to the player thread (game code and index pairing)
        playerThreads.emplace_back([gameCode, i]()
                                   {
            std::cout << "Player thread " << i << " in game " << gameCode 
                      << " started in process " << getpid() << "\n";
            std::this_thread::sleep_for(std::chrono::seconds(5)); // here, threads are put to sleep to simulate player activity
            std::cout << "Player thread " << i << " in game " << gameCode 
                      << " ended\n"; });
    }

    // wait for all player threads to finish
    for (auto &t : playerThreads)
    {
        // a thread that has finished execution, but has not yet been joined is considered an active thread of execution and is joinable
        if (t.joinable())
        {
            t.join(); // join a thread if joinable
        }
    }

    std::cout << "Game session for game code " << gameCode
              << " ended in process " << getpid() << "\n";
    exit(0); // End the child process when done.
}

int main()
{
    // one global instance
    // mongocxx::instance instance{};

    // moved here, should produce more unqiue game codes
    srand(time(NULL));

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
    // GET qui by ID (instead of by title)
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
    svr.Put("/api/edit-quiz", [](const httplib::Request &req, httplib::Response &res)
            {
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
        } });

    // User login endpoint
    svr.Post("/api/login", [](const httplib::Request &req, httplib::Response &res)
             {
        bool success = loginUser(req.body);
        std::string jsonResponse = success 
            ? R"({"success": true})" 
            : R"({"success": false, "error": "Failed to login"})";
        res.set_content(jsonResponse, "application/json"); });

    // Start Game endpoint (host starts a game)
    svr.Post("/api/start-game", [](const httplib::Request &req, httplib::Response &res)
             {
        // confirm the method is being called
        std::cout << "POST /api/start-game called" << std::endl;
        
        // Generate a unique game code, used by other players to join 
        std::string gameCode = generateUniqueGameCode();
                //new comment
        // Fork a new process: the host's game session
        pid_t pid = fork(); // creates a duplicate of the parent process, this creates a child process (where the game executes) 
        
        // check if fork() call was successful, or if fork failed (pid<0)
        if (pid < 0) {
            res.set_content(R"({"success": false, "error": "Fork failed"})", "application/json");
            return;
        } else if (pid == 0) {
            // when pid == 0, we are inside the child process
            runGameSession(gameCode); // run the child process logic 
        } else {
            // when pid > 0, we are inside the parent process
            {
                std::lock_guard<std::mutex> lock(activeGamesMutex);
                activeGames[gameCode] = GameSessionInfo{pid};
            }
            std::cout << "Started game session with code " << gameCode 
                      << " in child process " << pid << "\n";
            res.set_content(R"({"success": true, "gameCode": ")" + gameCode + R"("})", "application/json");
        } });

    // Join Game endpoint (player joins an existing game)
    svr.Post("/api/join-game", [](const httplib::Request &req, httplib::Response &res)
             {
    std::string gameCode = "";
    std::string nickname = "";

    // Naive JSON parsing - change to robust JSON lib in future
    size_t pos1 = req.body.find("\"gameCode\":");
    if (pos1 != std::string::npos) {
        size_t start = req.body.find("\"", pos1 + 11);
        size_t end = req.body.find("\"", start + 1);
        gameCode = req.body.substr(start + 1, end - start - 1);
    }

    size_t pos2 = req.body.find("\"nickname\":");
    if (pos2 != std::string::npos) {
        size_t start = req.body.find("\"", pos2 + 11);
        size_t end = req.body.find("\"", start + 1);
        nickname = req.body.substr(start + 1, end - start - 1);
    }

    // Validate both inputs
    if (gameCode.empty() || nickname.empty()) {
        res.set_content(R"({"success": false, "error": "Missing game code or nickname"})", "application/json");
        return;
    }

    {
        std::lock_guard<std::mutex> lock(activeGamesMutex);
        if (activeGames.find(gameCode) == activeGames.end()) {
            res.set_content(R"({"success": false, "error": "Game not found"})", "application/json");
            return;
        }

        // Create a new thread for the joining player
        std::thread joinThread([gameCode, nickname]() {
            std::cout << "[JOIN] Player " << nickname << " is joining game " << gameCode 
                      << " (handled in thread " << std::this_thread::get_id() << ")\n";

            // Optional: simulate active presence
            std::this_thread::sleep_for(std::chrono::seconds(60));
        });

        // Detach so it runs independently
        joinThread.detach();
    }

    res.set_content(R"({"success": true, "message": "Joined game successfully"})", "application/json"); });

    std::cout << "Server is running on http://localhost:5001\n";
    svr.listen("0.0.0.0", 5001);
    return 0;
}