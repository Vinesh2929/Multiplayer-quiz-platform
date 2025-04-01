# Apple Silicon (M1/M2) Makefile
CXX       := clang++
CXX_FLAGS := -Wall -Wextra -std=c++17 -g

# Direct paths from your installation
MONGOCXX_INCLUDE := /opt/homebrew/opt/mongo-cxx-driver/include
BSONCXX_INCLUDE  := /opt/homebrew/opt/mongo-cxx-driver/include
MONGOCXX_LIB     := /opt/homebrew/opt/mongo-cxx-driver/lib
MONGOC_LIB       := /opt/homebrew/opt/mongo-c-driver/lib

BIN       := bin
SRC       := src/main.cpp
INCLUDE   := -Iinclude \
             -I$(MONGOCXX_INCLUDE)/mongocxx/v_noabi \
             -I$(BSONCXX_INCLUDE)/bsoncxx/v_noabi \
             -I/opt/homebrew/opt/boost/include \
             -I/opt/homebrew/opt/openssl/include

LIBRARIES := -L$(MONGOCXX_LIB) \
             -L$(MONGOC_LIB) \
             -L/opt/homebrew/opt/boost/lib \
             -L/opt/homebrew/opt/openssl/lib \
             -lmongocxx -lbsoncxx \
             -lmongoc-1.0 -lbson-1.0 \
             -lboost_system \
             -lcrypto -lssl \
             -lpthread

EXECUTABLE := main

all: $(BIN)/$(EXECUTABLE)

run: all
	./$(BIN)/$(EXECUTABLE)

$(BIN)/$(EXECUTABLE): $(SRC)
	@mkdir -p $(BIN)
	$(CXX) $(CXX_FLAGS) $(INCLUDE) $^ -o $@ $(LIBRARIES)

clean:
	-rm -rf $(BIN)

.PHONY: all run clean