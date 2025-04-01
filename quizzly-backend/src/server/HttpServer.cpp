#include "server/HttpServer.hpp"
#include <iostream>

HttpServer::HttpServer(net::io_context& ioc, const std::string& address, unsigned short port)
    : ioc_(ioc),
      acceptor_(ioc, {net::ip::make_address(address), port}) {
    do_accept();
}

void HttpServer::start() {
    std::cout << "Server listening on " << acceptor_.local_endpoint() << std::endl;
    ioc_.run();
}

void HttpServer::do_accept() {
    acceptor_.async_accept(
        [this](beast::error_code ec, net::ip::tcp::socket socket) {
            if(!ec) {
                std::make_shared<beast::tcp_stream>(std::move(socket))->async_wait(
                    net::socket_base::wait_read,
                    [this, stream = std::make_shared<beast::tcp_stream>(std::move(socket))]
                    (beast::error_code ec) {
                        if(!ec) {
                            beast::flat_buffer buffer;
                            http::request<http::string_body> req;
                            http::read(*stream, buffer, req);
                            handle_request(std::move(req), stream);
                        }
                    });
            }
            do_accept();
        });
}

void HttpServer::handle_request(http::request<http::string_body>&& req, 
                              std::shared_ptr<beast::tcp_stream> stream) {
    http::response<http::string_body> res{http::status::ok, req.version()};
    res.set(http::field::server, "Quizzly Server");
    res.set(http::field::content_type, "text/plain");
    res.body() = "Quizzly API v1.0";
    res.prepare_payload();
    
    http::write(*stream, res);
    stream->socket().shutdown(net::ip::tcp::socket::shutdown_send);
}