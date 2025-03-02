use anchor_lang::{
    prelude::*,
    solana_program::{
        pubkey::Pubkey,
    },
    system_program,
};

use anchor_spl::{
    associated_token::{AssociatedToken},
    token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked, TransferChecked, SyncNative, sync_native},
};

use raydium_cpmm_cpi::{
    cpi,
    program::RaydiumCpmm,
    states::{AmmConfig, ObservationState, PoolState},
};





declare_id!("6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF");

#[program]
pub mod acey {
    use super::*;

    pub const ENTRY_PRICE: u64 = 100_000_000; //0.1 sol
    pub const ANTE_PRICE: u64 = 10_000_000; //0.01 sol

    pub const WAIT_TIME: u64 = 120; //2 minutes

    pub const ADMIN: Pubkey =
        pubkey!("SAFE3yY1gvuD78yaXqxnSKuUf5fYCxLb2TVzpuPdkHM");

    pub fn init_game(
        ctx: Context<InitializeGame>,
    ) -> Result<()> {

        let game_account = &mut ctx.accounts.game_account;
        game_account.entry_price = ENTRY_PRICE;
        game_account.ante_price = ANTE_PRICE;
        game_account.pot_amount = 0;
        game_account.next_skip_time = -1;

        game_account.card_1 = 0;
        game_account.card_2 = 0;
        game_account.card_3 = 0;

        game_account.current_bet = 0;

        game_account.players = Vec::new();
        game_account.player_no = 0;


        Ok(())
    }

    pub fn player_join(
        ctx: Context<PlayerJoin>,
        user_name: String,
    ) -> Result<()> {
        let game_account = &mut ctx.accounts.game_account;
        let new_id: u8 = game_account.player_no.wrapping_add(1);

        let current_time = Clock::get()?.unix_timestamp as i64;

        game_account.player_no = new_id;
        game_account.players.push(new_id);
        game_account.pot_amount += game_account.entry_price;

        let player_account = &mut ctx.accounts.player_account;
        player_account.user = ctx.accounts.signer.key();
        player_account.game_account = game_account.key();
        player_account.id = new_id;
        player_account.user_name = user_name;

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.signer.to_account_info().clone(),
                to: ctx.accounts.treasury_solana_account.to_account_info().clone(),
            },
        );
        system_program::transfer(cpi_context, game_account.entry_price)?; //sol transferred to treasury

        sync_native(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            SyncNative {
                account: ctx.accounts.treasury_solana_account.to_account_info(),
            },
        ))?;

        Ok(())
    }

    pub fn player_ante(
        ctx: Context<PlayerAnte>,
    ) -> Result<()> {
        let game_account = &mut ctx.accounts.game_account;
        let player_account = &ctx.accounts.player_account;

        require!(
            game_account.players.first().copied() == Some(player_account.id),
            CustomError::Unauthorized
        );
        
        game_account.pot_amount += game_account.ante_price;


        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.signer.to_account_info().clone(),
                to: ctx.accounts.treasury_solana_account.to_account_info().clone(),
            },
        );
        system_program::transfer(cpi_context, game_account.entry_price)?; //sol transferred to treasury

        sync_native(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            SyncNative {
                account: ctx.accounts.treasury_solana_account.to_account_info(),
            },
        ))?;

        //card_1 picked
        //card_2 picked

        Ok(())
    }

    pub fn player_bet(
        ctx: Context<PlayerAnte>,
        bet_amount: u64,
    ) -> Result<()> {

        let game_account = &mut ctx.accounts.game_account;
        let player_account = &ctx.accounts.player_account;

        require!(bet_amount <= game_account.pot_amount,
            CustomError::BetBiggerThanPot
        );

        require!(
            game_account.players.first().copied() == Some(player_account.id),
            CustomError::Unauthorized
        );

        game_account.pot_amount += bet_amount;
        game_account.current_bet = bet_amount;

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.signer.to_account_info().clone(),
                to: ctx.accounts.treasury_solana_account.to_account_info().clone(),
            },
        );
        system_program::transfer(cpi_context, bet_amount)?; //sol transferred to treasury

        sync_native(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            SyncNative {
                account: ctx.accounts.treasury_solana_account.to_account_info(),
            },
        ))?;

        Ok(())
    }

    pub fn player_claim(
        ctx: Context<PlayerJoin>,
    ) -> Result<()> {

        let game_account = &mut ctx.accounts.game_account;
        let player_account = &ctx.accounts.player_account;

        require!(
            game_account.players.first().copied() == Some(player_account.id),
            CustomError::Unauthorized
        );

        // if win, change to clubmoon and give it to them

        // if lose, nothing happens.

        game_account.current_bet = 0;

        if !game_account.players.is_empty() {
            if let Some(first_player) = game_account.players.first().cloned() {
                game_account.players.remove(0); // Remove the first player
                game_account.players.push(first_player); // Push it to the back
            }
        }

        Ok(())
    }

    pub fn player_leave(
        ctx: Context<PlayerLeave>
    ) -> Result<()> {
        let game_account = &mut ctx.accounts.game_account;
        let player_account = &ctx.accounts.closing_player_account;

        require!(
            game_account.players.first().copied() == Some(player_account.id),
            CustomError::Unauthorized
        );

        Ok(())


    }

    pub fn kick_player(
        ctx: Context<PlayerLeave>,
    ) -> Result<()> {

        let game_account = &mut ctx.accounts.game_account;
        let closing_player_account = &ctx.accounts.closing_player_account;

        let current_time = Clock::get()?.unix_timestamp as i64;

        require!(
            game_account.players.contains(&closing_player_account.id),
            CustomError::Unauthorized
        );

        require!(
            closing_player_account.game_account == game_account.key(),
            CustomError::Unauthorized
        );

        if closing_player_account.user == ctx.accounts.signer.key() {
            // Remove the player ID from the `players` vector
            game_account.players.retain(|&id| id != closing_player_account.id);
         /* } else { // if time has passed kicking time
            */
        } 


        

        

        


        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + GameAccount::INIT_SPACE,
        seeds = [b"game"],
        bump,
    )]
    pub game_account: Account<'info, GameAccount>,

    
    #[account(mut)]
    pub clubmoon_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub solana_mint: InterfaceAccount<'info, Mint>,


    #[account(
        init,
        seeds = [b"clubmoon", game_account.key().as_ref()],
        bump,
        payer = signer,
        token::mint = clubmoon_mint,
        token::authority = treasury_clubmoon_account,
    )]
    pub treasury_clubmoon_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        seeds = [b"solana", game_account.key().as_ref()],
        bump,
        payer = signer,
        token::mint = solana_mint,
        token::authority = treasury_solana_account,
    )]
    pub treasury_solana_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    
}

#[derive(Accounts)]
pub struct PlayerJoin<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"game"],
        bump,
    )]
    pub game_account: Account<'info, GameAccount>,

    #[account(
        init,
        payer = signer,
        space = 8 + PlayerAccount::INIT_SPACE,
        seeds = [b"player", game_account.key().as_ref(), signer.key().as_ref()],
        bump,
    )]
    pub player_account: Account<'info, PlayerAccount>,

    #[account(
        mut,
        seeds = [b"solana", game_account.key().as_ref()],
        bump,
    )]
    pub treasury_solana_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlayerLeave<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"game"],
        bump,
    )]
    pub game_account: Account<'info, GameAccount>,

    #[account(
        mut,
        close = signer,
    )]
    pub closing_player_account: Account<'info, PlayerAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlayerAnte<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"game"],
        bump,
    )]
    pub game_account: Account<'info, GameAccount>,

    #[account(
        mut,
        seeds = [b"player", game_account.key().as_ref(), signer.key().as_ref()],
        bump,
    )]
    pub player_account: Account<'info, PlayerAccount>,


    #[account(
        mut,
        seeds = [b"solana", game_account.key().as_ref()],
        bump,
    )]
    pub treasury_solana_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}


#[account]
#[derive(InitSpace)]
pub struct GameAccount { //8
    pub entry_price: u64, //8
    pub ante_price: u64, //8
    pub pot_amount: u64, //8
    pub next_skip_time: i64, //8

    pub card_1: u8, // 1
    pub card_2: u8, // 1
    pub card_3: u8, // 1

    pub current_bet: u64, // 8

    #[max_len(100)]  
    pub players: Vec<u8>, //100
    pub player_no: u8, //8  how many players have been through
}

#[account]
#[derive(InitSpace)]
pub struct PlayerAccount { //8
    pub user: Pubkey, //32
    pub game_account: Pubkey, //32

    #[max_len(100)]  
    pub user_name: String,
    pub id: u8, //1
}


#[error_code]
pub enum CustomError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Can't bet bigger than the pot")]
    BetBiggerThanPot,

}