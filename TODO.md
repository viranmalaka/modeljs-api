TODO
--
- Create models
  - [x] normal Models
  - [x] with reference
  - [ ] with different types. (inside arrays)
  
- Read Models
  - [x] Get all
  - [x] get by filter
  - [x] get with population
  - [x] get with selected columns
  - [x] get by id
  - [x] find one by a query

- Edit Models (PUT and PATCH)
  - [x] Edit by id 
  - [x] Edit by a query
  - [ ] Add the validator (# still pre hooks can be used to archive this)

- Delete Models (DELETE)
  - [x] Delete by id 
  - [x] Delete by a query
  
- Authentication
  - [x] Sign Up
  - [x] Log In
  - [x] Private actions
  - [x] allPrivate flag
  - [ ] Password reset
  - [ ] Roll definition
  - [ ] Roll based endpoint access
  - [ ] Roll based keys reading
  - [ ] Roll based keys writing
  - [ ] config to define which actions are auth request and which are not.
  - [ ] create admin with a secret code in header
  
  
 - Add Hooks
  - [x] specify a request and add pre and post hooks.
  
 - Block actions
  - [x] Block specific action for specific model. 
  ``If both allowed set and not allowed set is there, allowed set is prioritiesed``
  
 - Additional Configs
  - [x] Take database name from config
  
 - Other
  - [x] Add the automatic key hiding feature in mongoose for password
