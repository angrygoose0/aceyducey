solana program deploy target/deploy/acey.so --with-compute-unit-price 300000 --use-rpc --max-sign-attempts 1000 solana config set --url ""

solana-keygen new --outfile target/deploy/acey-keypair.json --force 
anchor keys sync

solana program close 27GsfeibJMv8hftdRzaoSTgnCUB7RqnjUAnWW6EBiJub --bypass-warning