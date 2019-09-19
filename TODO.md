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
  - [ ] Add the validator

- Delete Models (DELETE)
  - [x] Delete by id 
  - [x] Delete by a query
  
- Authentication
  - [ ] Sign Up
  - [ ] Log In
  - [ ] Password reset
  - [ ] Roll definition
  - [ ] Roll based endpoint access
  - [ ] Roll based keys reading
  - [ ] Roll based keys writing
  - [ ] config to define which actions are auth request and which are not.
  
 - Add Hooks
  - [x] specify a request and add pre and post hooks.
  
 - Block actions
  - [ ] Block specific action for specific model. 
  ``If both allowed set and not allowed set is there, allowed set is prioritiesed``
  
 - Additional Configs
  - [ ] Take Order name from config
  
 - Other
  - [ ] Add the automatic key hiding feature in mongoose for password
