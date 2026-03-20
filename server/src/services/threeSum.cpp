class Solution {
public:
//Most optimized approach will be 2 pointer approach
    vector<vector<int>> threeSum(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> ans;
        sort(nums.begin(), nums.end()); //without sorting movement will be tough!

        for (int i = 0; i < n; i++) {
            if (i > 0 && nums[i] == nums[i - 1])
                continue; // skip duplicate i
            int j = i + 1;
            int k = n - 1;
            while (j < k) {
                int sum = nums[i] + nums[j] + nums[k];
                if (sum == 0) {
                    ans.push_back({nums[i], nums[j], nums[k]});
                    j++;
                    k--;

                    while (j < k && nums[j] == nums[j - 1])
                        j++; // skip duplicate j
                    while (j < k && nums[k] == nums[k + 1])
                        k--; // skip duplicate k
                }

                else if (sum < 0)
                    j++;
                else
                    k--;
            }
        }
        return ans;
    }

    // using set approachf
    //     // the approach would be:
    //     // In the array while fixing a number which is nums[i]
    //     // we iterate on second number while searching for third number in
    //     set
    //     // with this equation it helps a lot a + b+c=0; b+c =-a = target and
    //     so
    //     // on solving for more

    //     int n = nums.size();
    //     set<vector<int>> ans;

    //     for (int i = 0; i < n; i++) {
    //         unordered_set<int> s;
    //         int target = -nums[i];

    //         for (int j = i + 1; j < n; j++) {
    //             int thirdNumber = target - nums[j];
    //             if (s.find(thirdNumber) != s.end()) {
    //                 vector<int> triplet = {nums[i], nums[j], thirdNumber};
    //                 sort(triplet.begin(), triplet.end()); //this step might
    //                 be doubtful
    //                 //Sorting ensures triplet have same order and so
    //                 duplicate collapse into one
    //                 //for example
    //                 //[-1, 0, 1]
    //                 //[0, -1, 1]
    //                 //[-1, 1, 0]
    //                 //even thought logically they represent the same triplet
    //                 //{ -1, 0, 1 }   !=   { 0, -1, 1 }

    //                 ans.insert(triplet);
    //             }

    //             s.insert(nums[j]);
    //         }
    //     }
    //     return vector<vector<int>>(ans.begin(), ans.end());
    // }
};