module.exports = {
  // naming conventions; 
  naming: {
    // available options for first parameter: 
    // - single (ex: closed-ticket)
    // - plural (ex: closed-tickets)
    // available options for second parameter:
    // - lower (ex: closedtickets)
    // - upper (ex: CLOSEDTICKETS)
    // - camel (ex: closedTickets)
    // - snake (ex: closed_tickets)
    // - kebab (ex: closed-tickets)
    // - pascal (ex: ClosedTickets)

    // dir names in /components 
    componentDirs: ['single', 'kebab'],

    // table names in the database
    dbTables: ['plural', 'camel'],

    // names of columns in the database
    dbColumns: 'camel',

    // names of properties of the queried data
    jsProps: 'camel',

    // note that having different dbColumns ans jsProps may cause performance issues when dealing with big datasets
  },
  // path to static client files if using a SPA
  spaClientPath: 'client',

  // parent route to all http endpoints
  apiRoute: '/api',

  // parent route to all csv endpoints
  csvRoute: '/csv',
  
}