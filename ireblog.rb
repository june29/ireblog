require "sinatra"
require "tumblr"
require "haml"
require "json"

class IReblog
  class Application < Sinatra::Application
    @@number  = 30
    @@maximum = 250

    configure do
      email    = ENV["EMAIL"]
      password = ENV["PASSWORD"]

      @@tumblr = Tumblr.new(email, password)
    end

    get "/" do
      haml :index
    end

    post "/reblog" do
      post_id    = params[:post_id]
      reblog_key = params[:reblog_key]

      @@tumblr.writer.reblog({ :"post-id" => post_id, :"reblog-key" => reblog_key }).perform
    end

    get "/dashboard" do
      page  = params[:page].to_i
      start = page == -1 ? rand(@@maximum) : @@number * (page - 1)

      posts = @@tumblr.dashboard({ :start => start, :num => @@number }).perform.
                       parse["tumblr"]["posts"]["post"].reject { |post| post["type"] =~ /video|audio/ }

      return JSON.generate(posts)
    end
  end
end
