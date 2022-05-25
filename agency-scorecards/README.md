# Processing Data
New data should only be accepted in the agreed upon .XLSX format.

## Steps for Ingestion
1. Open .XLSX and select Save As > .CSV UTF-8 delimited
2. Quality check the .CSV to make sure no spaces appear in the column headers
3. Navigate to [CSV-to-JSON](https://www.convertcsv.com/csv-to-json.htm) website
4. Upload file
5. Save as .JSON

This should product an array of JSON with individual objects, each one representing an agency.

### Sample Data
Here is an example of the expected fields and formats/sample data:

```
agency_grade: "A+"
agency_score: "122.80%"
category_hz_cfy_vendor_count: " 389 "
category_hz_percent_change: "-4.0%"
category_hz_pfy_vendor_count: " 405 "
category_hz_vendor_score: 0.9
category_sb_cfy_vendor_count: " 5,286 "
category_sb_percent_change: "-11.63%"
category_sb_pfy_vendor_count: " 5,982 "
category_sb_vendor_score: 0.7
category_sdb_cfy_vendor_count: " 2,162 "
category_sdb_percent_change: "-7.01%"
category_sdb_pfy_vendor_count: " 2,325 "
category_sdb_vendor_score: 0.8
category_sdvosb_cfy_vendor_count: " 555 "
category_sdvosb_percent_change: "-1.60%"
category_sdvosb_pfy_vendor_count: " 564 "
category_sdvosb_vendor_score: 0.9
category_wosb_cfy_vendor_count: " 1,130 "
category_wosb_percent_change: "-11.9%"
category_wosb_pfy_vendor_count: " 1,282 "
category_wosb_vendor_score: 0.7
comments: "The Department of Homeland Security (DHS) is honored to receive the grade of A+..."
department_acronym: "DHS"
department_friendly_name: "Department of Homeland Security"
department_id: 7000
department_name: "HOMELAND SECURITY, DEPARTMENT OF (7000)"
fiscal_year: 2021
industry_category_score: "80.0%"
industry_category_total_score: 4
industry_total_score: "8.0%"
peer_review_average_total: 22
peer_review_k0: 1
peer_review_k1: 1
peer_review_k2: 1
peer_review_k3: 1
peer_review_k4: 1
peer_review_k5: 1
peer_review_k6: 1
peer_review_k7: 1
peer_review_k8: 1
peer_review_k9: 1
peer_review_k10: 1
peer_review_k11: 1
peer_review_k12: 1
peer_review_k13: 1
peer_review_k14: 1
peer_review_k15: 1
peer_review_k16: 1
peer_review_k17: 1
peer_review_k18: 1
peer_review_k19: 1
peer_review_k20: 1
peer_review_k21: 1
peer_review_score: 22
peer_review_total_score: "20.00%"
prime_hz_category_achievement: "18.33%"
prime_hz_category_weight: "10.00%"
prime_hz_cfy_achievement: "5.50%"
prime_hz_cfy_goal: "3.00%"
prime_hz_dollars: "$1.1  B"
prime_hz_pfy2_achievement: "4.34%"
prime_hz_pfy3_achievement: "3.85%"
prime_hz_pfy4_achievement: "3.61%"
prime_hz_pfy_achievement: "4.09%"
prime_sb_category_achievement: "69.02%"
prime_sb_category_weight: "60.00%"
prime_sb_cfy_achievement: "38.25%"
prime_sb_cfy_goal: "33.25%"
prime_sb_dollars: "$8.0  B"
prime_sb_pfy2_achievement: "36.96%"
prime_sb_pfy3_achievement: "34.47%"
prime_sb_pfy4_achievement: "34.25%"
prime_sb_pfy_achievement: "36.04%"
prime_sdb_category_achievement: "20.00%"
prime_sdb_category_weight: "10.00%"
prime_sdb_cfy_achievement: "17.17%"
prime_sdb_cfy_goal: "5.00%"
prime_sdb_dollars: "$1.4  B"
prime_sdb_pfy2_achievement: "17.69%"
prime_sdb_pfy3_achievement: "15.22%"
prime_sdb_pfy4_achievement: "14.31%"
prime_sdb_pfy_achievement: "15.57%"
prime_sdvosb_category_achievement: "17.63%"
prime_sdvosb_category_weight: "10.00%"
prime_sdvosb_cfy_achievement: "5.29%"
prime_sdvosb_cfy_goal: "3.00%"
prime_sdvosb_dollars: "$1.1  B"
prime_sdvosb_pfy2_achievement: "6.12%"
prime_sdvosb_pfy3_achievement: "5.56%"
prime_sdvosb_pfy4_achievement: "5.72%"
prime_sdvosb_pfy_achievement: "5.77%"
prime_total_score: "69.38%"
prime_wosb_category_achievement: "13.78%"
prime_wosb_category_weight: "10.00%"
prime_wosb_cfy_achievement: "6.89%"
prime_wosb_cfy_goal: "5.00%"
prime_wosb_dollars: "$3.6  B"
prime_wosb_pfy2_achievement: "8.41%"
prime_wosb_pfy3_achievement: "7.43%"
prime_wosb_pfy4_achievement: "7.87%"
prime_wosb_pfy_achievement: "6.80%"
sort_order: 6
sub_hz_category_achievement: "7.67%"
sub_hz_category_weight: "10.00%"
sub_hz_cfy_achievement: "2.30%"
sub_hz_cfy_goal: "3.00%"
sub_hz_dollars: "$61.3 M"
sub_hz_pfy2_achievement: "2.10%"
sub_hz_pfy3_achievement: "3.80%"
sub_hz_pfy4_achievement: "3.30%"
sub_hz_pfy_achievement: "2.10%"
sub_sb_category_achievement: "64.09%"
sub_sb_category_weight: "60.00%"
sub_sb_cfy_achievement: "45.40%"
sub_sb_cfy_goal: "42.50%"
sub_sb_dollars: "$1.2  B"
sub_sb_pfy2_achievement: "45.40%"
sub_sb_pfy3_achievement: "50.00%"
sub_sb_pfy4_achievement: "49.70%"
sub_sb_pfy_achievement: "46.30%"
sub_sdb_category_achievement: "20.00%"
sub_sdb_category_weight: "10.00%"
sub_sdb_cfy_achievement: "10.90%"
sub_sdb_cfy_goal: "5.00%"
sub_sdb_dollars: "$283.9 M"
sub_sdb_pfy2_achievement: "9.90%"
sub_sdb_pfy3_achievement: "8.50%"
sub_sdb_pfy4_achievement: "10.90%"
sub_sdb_pfy_achievement: "11.50%"
sub_sdvosb_category_achievement: "15.33%"
sub_sdvosb_category_weight: "10.00%"
sub_sdvosb_cfy_achievement: "4.60%"
sub_sdvosb_cfy_goal: "3.00%"
sub_sdvosb_dollars: "$120.5 M"
sub_sdvosb_pfy2_achievement: "4.40%"
sub_sdvosb_pfy3_achievement: "3.10%"
sub_sdvosb_pfy4_achievement: "4.70%"
sub_sdvosb_pfy_achievement: "4.40%"
sub_total_score: "25.42%"
sub_wosb_category_achievement: "20.00%"
sub_wosb_category_weight: "10.00%"
sub_wosb_cfy_achievement: "13.50%"
sub_wosb_cfy_goal: "5.00%"
sub_wosb_dollars: "$351.4 M"
sub_wosb_pfy2_achievement: "11.00%"
sub_wosb_pfy3_achievement: "10.30%"
sub_wosb_pfy4_achievement: "11.80%"
sub_wosb_pfy_achievement: "13.10%"
```

# Development and Setup
There's nothing to install, no scripts to run, or dependencies to verify.  It's all vanilla JavaScript on top of regular old HTML and CSS.  The only dependency is [Chart.js](https://www.chartjs.org/), which we have downloaded manually and committed to this repository.