solana program deploy target/deploy/acey.so --with-compute-unit-price 300000 --use-rpc --max-sign-attempts 1000 solana config set --url ""

solana-keygen new --outfile target/deploy/acey-keypair.json --force 
anchor keys sync

solana program close 27GsfeibJMv8hftdRzaoSTgnCUB7RqnjUAnWW6EBiJub --bypass-warning

https://boldest-thrilling-market.solana-mainnet.quiknode.pro/b4c82bf3b9abce9c0f2a06b213b35da920beaf58/