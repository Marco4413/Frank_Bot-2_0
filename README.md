# Frank Bot 2.0

## What version are python scripts made for and what libraries do they use?

 - The version of Python currently in use is "Python 3.8"
 - No external libraries are used except for the standard ones

## What do the python scripts do?

 - There are currently 2 main python scripts:
  1. `localeHelper.py` which is used to make translating to other locales easier, just follow the steps that it asks you
  2. `createCommand.py` which is used to create a new command, just follow its instructions to create a new command (NOTE: If the command is moved from `commands/` then you should require it manually on `commands.js`)

## Steps to run this project:

1. Create a file named `.env` and add all the following fields (NOTE: This project uses Postgres):
  - debug_log = false
  - token = "INSERT DISCORD TOKEN HERE"
  - db_host     = "DATABASE HOST"
  - db_port     = 5432
  - db_username = "DATABASE USERNAME"
  - db_password = "DATABASE PASSWORD"
  - db_name     = "DATABASE NAME"
2. Run `npm i` to install all dependencies
3. Run `node .` to run the project
