cmake_minimum_required(VERSION 3.15)
project(QuizzlyBackend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find dependencies
find_package(Boost 1.71 REQUIRED COMPONENTS system)
find_package(libmongocxx REQUIRED)
find_package(libbsoncxx REQUIRED)

# Include directories
include_directories(
    ${CMAKE_SOURCE_DIR}/include
    ${Boost_INCLUDE_DIRS}
    ${LIBMONGOCXX_INCLUDE_DIRS}
    ${LIBBSONCXX_INCLUDE_DIRS}
)

# Source files
set(SOURCES
    src/main.cpp
    src/database/MongoConnector.cpp
    src/server/HttpServer.cpp
)

add_executable(quizzly_backend ${SOURCES})

# Link libraries
target_link_libraries(quizzly_backend
    PRIVATE
    Boost::boost
    Boost::system
    libmongocxx
    libbsoncxx
)