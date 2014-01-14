#!/usr/bin/perl

# Radio Calendar Page - For viewing and updating the Radio Calendar

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "sql.pl";
require "interface.pl";
require "record.pl";
require 'login.pl';
require 'search.pl';
require 'misc.pl';
require 'task.pl';

require 'event.pl';
$tbl = &TblInit;

use CGI;
my($cgi) = new CGI;
my $params = $cgi->Vars;
my $sortby = ($$params{sortby});

$user = &loginSession($$params{session});
&printHead({name=>'RadioCal'}, $cgi, $user);

# Daniel O'Neil - 2/22/02
# Two main things can be done with the radio calendar:
#  1) Viewing it to read over the air
#  2) Editing it to keep it up to date (duh)
# In theory, anybody should be able to view the radio calendar,
# just like they can view the schedule. However, since I'm
# paranoid, I'm going to set it to require User level auth,
# which can be changed really easily.

# If they want to edit and AuthGTE(Exec), display with editing abilities
if($$params{action} eq 'edit') {

  &error("You need an Exec account to use this page")
    unless &AuthGTE($$user{AuthLevel}, 'Exec');

  # DISPLAY CALENDAR WITH EDIT
}
# ElseIf AuthGTE(User), just display:
else {

  &error("You need a User accoun to use this page")
    unless &AuthGTE($$user{AuthLevel}, 'User');

  # DISPLAY JUST THE CALENDAR
}
&printFoot({name=>'Bin'}, $cgi, $user);
