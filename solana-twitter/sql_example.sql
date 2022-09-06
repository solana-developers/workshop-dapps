
CREATE TABLE profiles (
    profile_id INT,
    handle VARCHAR(45),
    display_name VARCHAR(45),
    tweet_count INT,
    authority VARCHAR(45)
);
CREATE TABLE tweets (
    tweet_id INT,
    profile_id INT,
    tweet_number INT,
    like_count INT,
    retweet_count INT,
    body VARCHAR(45),
)
CREATE TABLE likes (
    like_id: INT,
    tweet_id INT,
    submitter_profile_id INT,
)
CREATE TABLE retweets (
    retweet_id: INT,
    tweet_id INT,
    submitter_profile_id INT,
)
