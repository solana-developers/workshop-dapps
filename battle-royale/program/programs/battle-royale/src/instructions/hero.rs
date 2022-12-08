use anchor_lang::{
    AccountsClose,
    prelude::*,
};

use crate::state::Hero;


pub fn create_hero(
    ctx: Context<CreateHero>,
    id: Pubkey,
    icon: String,
    name: String,
    current_weapon: u8,
) -> Result<()> {

    ctx.accounts.hero.set_inner(
        Hero::new(
            *ctx.bumps.get(Hero::TABLE_NAME).expect("Bump not found."),
            id,
            icon,
            name,
            current_weapon,
        )
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    id: Pubkey,
    icon: String,
    name: String,
    current_weapon: u8,
)]
pub struct CreateHero<'info> {
    #[account(
        init,
        space = Hero::INNER_DATA_SIZE,
        payer = payer,
        seeds = [
            Hero::TABLE_NAME.as_bytes().as_ref(),
            id.as_ref(),
        ],
        bump,
    )]
    hero: Account<'info, Hero>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}


pub fn update_hero(
    ctx: Context<UpdateHero>,
    id: Pubkey,
    icon: String,
    name: String,
    kills: u8,
    current_weapon: u8,
) -> Result<()> {

    assert!(id == ctx.accounts.hero.id);
    let hero = &mut ctx.accounts.hero;
    hero.icon = icon;
    hero.name = name;
    hero.kills = kills;
    hero.current_weapon = current_weapon;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateHero<'info> {
    #[account(
        mut,
        seeds = [
            Hero::TABLE_NAME.as_bytes().as_ref(),
            hero.id.as_ref(),
        ],
        bump,
    )]
    hero: Account<'info, Hero>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}


pub fn delete_hero(
    ctx: Context<DeleteHero>,
    id: Pubkey,
) -> Result<()> {

    assert!(id == ctx.accounts.hero.id);
    ctx.accounts.hero.close(ctx.accounts.payer.to_account_info())
}

#[derive(Accounts)]
pub struct DeleteHero<'info> {
    #[account(
        mut,
        seeds = [
            Hero::TABLE_NAME.as_bytes().as_ref(),
            hero.id.as_ref(),
        ],
        bump,
    )]
    hero: Account<'info, Hero>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}