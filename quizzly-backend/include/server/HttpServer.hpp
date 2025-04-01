#pragma once
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <memory>

namespace beast = boost::beast;
namespace http = beast::http;
namespace net = boost::asio;

class HttpServer {
public:
    HttpServer(net::io_context& ioc, const std::string& address, unsigned short port);
    void start();

private:
    void do_accept();
    void handle_request(http::request<http::string_body>&& req, 
                      std::shared_ptr<beast::tcp_stream> stream);

    net::io_context& ioc_;
    net::ip::tcp::acceptor acceptor_;
};