#!/usr/bin/perl

# Democracy Now! database integration.

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
require 'interface.pl';
require 'login.pl';
require 'dn.pl';

use CGI;

my($cgi) = new CGI;
my $params = $cgi->Vars;

if (($$params{session} or ($$params{User}
    and ($$params{session} = &OpenSession($$params{User},$$params{Password},{debug=>$$params{debug}}))))
    and $user = &loginSession(@$params{'session','debug'})) {

&printHead($tbl, $cgi, $user);
  my ($tasks) = &sqlSelectMany({table=>'UserTasks'}, ['Task'],
                               {string=>'UserID = ?', values=>[$$user{UserID}]},
                               undef, {nolookup=>1, debug=>$$params{debug}});
my ($found) = 0;
  for (@$tasks) {
      $found = 1 if $$_{Task} eq 'democracynow';
  }

if ($found == 1) {
#print '<table border="0" width="500"><tr><td>',"\n\n";
    
    if ($$params{op} eq 'airing') {
	print qq~<H1>Airing &quot;Democracy Now!&quot;</H1>~;
	print `cat /afs/andrew/org/wrct/db/src/dn/airing.html`;
	
    } elsif ($$params{op} eq 'signup') {
	
      do_signup($cgi);

    }
    
} else {
    print qq~<H1>Error</H1>
	Sorry, but you are not authorized for this section of the database. Please contact the <A HREF="pa@wrct.org">Public Affairs Director</A>.
	~;
}
    &printFoot($tbl, $cgi, $user);
} else {
&printHead({name=>'Login'}, $cgi);

  print qq~
<table border="0" cellspacing="0" cellpadding="0" width="100%">
  <tr valign="middle">
    <td align="center">

<h1>wrct: a database</h1>
    ~;

    print qq~<H1>Democracy Now would like to take this moment to say "I love you"</H1>~;
}
