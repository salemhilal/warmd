sub error {
  my ($msg) = @_;
  $msg = "(unknown)" unless $msg;

  print "<h2>Server Error: $msg</h2>\n";
  exit(0);
}

1;
