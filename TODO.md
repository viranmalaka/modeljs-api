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
  - [x] get full count
  - [x] introduce pagination.

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
  - [x] config to define which actions are auth request and which are not.
  - [x] create admin with a secret code in header
  - [x] Sign Up pre hook
  
  
 - Add Hooks
  - [x] specify a request and add pre and post hooks.
  
 - Block actions
  - [x] Block specific action for specific model. 
  ``If both allowed set and not allowed set is there, allowed set is prioritiesed``
  
 - Additional Configs
  - [x] Take database name from config
  
 - Other
  - [x] Add the automatic key hiding feature in mongoose for password
  - [x] Adding extended routes.

###Testing
- [x] create 100%
- [ ] get, getOne, getById (70%)
- [ ] update, updateById (0%)
- [ ] delete, deleteById (0%)
- each one has
    - logic
    - hooks
    - allowed, not allowed request
    - different filters, selectors, populate, complexPopulate
    - Error scenarios
    
- Authentication
    - [ ] user create (normal, admins, different roles)
    - [ ] user create hooks, validations, different user model shapes
    - [ ] private routes, public routes, allowed actions.
    - [ ] admin creations, admin create fail scenarios
    - [ ] password reset
    - [ ] role base actions
    - [ ] role base key reading, writing

