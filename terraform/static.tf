module "yumi" {
  source = "USSBA/static-website/aws"
  version = "~> 5.0"

  domain_name         = "static.www.sba.gov"
  acm_certificate_arn = data.aws_acm_certificate.selected.arn

  # Optional
  ## Ensures route53 record is created
  hosted_zone_id = data.aws_route53_zone.selected.id
  ## Routes requests to `/foo/bar/` to `/foo/bar/index.html`
  index_redirect = true
  ## Routes requests to `/foo/bar` to `/foo/bar/index.html`
  index_redirect_no_extension = true
  ## Injects an HSTS header in all responses
  hsts_header = "max-age=31536000"

  cloudfront_allowed_methods = "get"
  cors_allowed_origins       = ["https//www.sba.gov"]
}
