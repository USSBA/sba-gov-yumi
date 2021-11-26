## hosted zone
data "aws_route53_zone" "selected" {
  name = "sba.gov"
}

## acm
data "aws_acm_certificate" "selected" {
  domain      = "content.sba.gov"
  statuses    = ["ISSUED"]
  most_recent = true
}
