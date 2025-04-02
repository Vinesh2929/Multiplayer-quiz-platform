# Makefile
CXX = clang++
CXXFLAGS = -Wall -Wextra -std=c++17 -g \
           -Iinclude \
           -I/opt/homebrew/opt/mongo-cxx-driver/include/mongocxx/v_noabi \
           -I/opt/homebrew/opt/mongo-cxx-driver/include/bsoncxx/v_noabi \
           -I/opt/homebrew/opt/boost/include \
           -I/opt/homebrew/opt/openssl/include
LDFLAGS = -L/opt/homebrew/opt/mongo-cxx-driver/lib \
          -L/opt/homebrew/opt/mongo-c-driver/lib \
          -L/opt/homebrew/opt/boost/lib \
          -L/opt/homebrew/opt/openssl/lib
LDLIBS = -lmongocxx -lbsoncxx -lmongoc-1.0 -lbson-1.0 \
         -lboost_system -lcrypto -lssl -lpthread

SRC = src/main.cpp src/createQuiz.cpp src/register.cpp
OBJ = $(SRC:.cpp=.o)
TARGET = bin/main

all: $(TARGET)

$(TARGET): $(OBJ)
	@mkdir -p bin
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $^ -o $@ $(LDLIBS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -rf bin $(OBJ)

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run