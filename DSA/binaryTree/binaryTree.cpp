#include <iostream>
#include <vector>
#include <queue>
using namespace std;

class Node{
    public:
    int data;
    Node* left;
    Node* right;
    
    Node(int val){
        data = val;
        left = NULL;
        right = NULL;
    }
    
};

//build tree
static int idx = -1;
Node* buildTree(vector<int> preorder) {
    idx++;
    if(preorder[idx] == -1) return NULL;
    Node* root = new Node(preorder[idx]);
    
    root->left = buildTree(preorder);
    root->right = buildTree(preorder);
    
    return root;
    
}

//preorder traversal
void preOrder(Node* root){
    if(root == NULL) return;
    
    cout<< root->data << " ";
    preOrder(root->left);
    preOrder(root->right);
}

//inOrder traversal
void inOrder(Node* root){
    if(root == NULL) return;
    
    inOrder(root->left);
    cout<< root->data << " ";
    inOrder(root->right);
}

//postOrder traversal
void postOrder(Node* root){
    if(root == NULL) return;
    
    postOrder(root->left);
    postOrder(root->right);
    cout<< root->data << " ";
}

//Level order traversal
void levelOrder(Node* root) {
    queue<Node*> q;
    q.push(root);
    while(q.size() > 0){
        Node* curr = q.front();
        q.pop();
        cout<<curr->data<<" ";
        
        if(curr->left != NULL)
        q.push(curr->left);
        
        if(curr->right != NULL)
        q.push(curr->right);
    }
}


//Level order traversal
//printing with level
void levelOrderWithLvels(Node* root) {
    queue<Node*> q;
    q.push(root);
    q.push(NULL);
    while(q.size() > 0){
        Node* curr = q.front();
        q.pop();
        if(curr == NULL){
            if(q.size() != 0){
                cout<<endl;
                q.push(NULL);
                continue;
            }
            else
            break; //break the loop
        }
        cout<<curr->data<<" ";
        
        if(curr->left != NULL)
        q.push(curr->left);
        
        if(curr->right != NULL)
        q.push(curr->right);
        
    }
}


int heightOfTreewithQueue(Node* root) {
    queue<Node*> q;
    q.push(root);
    q.push(NULL);
    int count = 1;
    while(q.size() > 0){
        Node* curr = q.front();
        q.pop();
        if(curr == NULL){
            if(q.size() != 0){
                // cout<<endl;
                q.push(NULL);
                count++;
                continue;
            }
            else
            break; //break the loop
        }
        // cout<<curr->data<<" ";
        
        if(curr->left != NULL)
        q.push(curr->left);
        
        if(curr->right != NULL)
        q.push(curr->right);
        
    }
    return count;
}

int heightofTreeWithRecursion(Node* root){
    if(root == NULL) return 0;
    
    int leftHt = heightofTreeWithRecursion(root->left);
    int rightHt = heightofTreeWithRecursion(root->right);
    
    return max(leftHt, rightHt) + 1;
}

int countNode(Node* root){
    if(root == NULL) return 0;
    
    int leftCount = countNode(root->left);
    int rightCount = countNode(root->right);
    
    return leftCount + rightCount + 1;
}


int sumOfNodes(Node* root){
    if(root == NULL) return 0;
    
    int leftCount =  sumOfNodes(root->left);
    int rightCount =  sumOfNodes(root->right);
    
    return leftCount + rightCount + root->data;
}



int main()
{
    vector<int> preorder = {1,2,-1,-1,3,4,-1,-1,5,-1,-1};
//     vector<int> preorder = {
//     1,
//     2,
//     4,
//     8, -1, -1,
//     9, -1, -1,
//     5,
//     10, -1, -1,
//     11, -1, -1,
//     3,
//     6,
//     12, -1, -1,
//     13, -1, -1,
//     7,
//     14, -1, -1,
//     15, -1, -1
// };
    
    Node* root = buildTree(preorder);
    
    // preOrder(root);
    // inOrder(root);
    // postOrder(root);
    // levelOrder(root);
    // levelOrderWithLvels(root);
    // cout << heightOfTree(root);
    // cout << heightofTreeWithRecursion(root);
    // cout << countNode(root);
    cout << sumOfNodes(root);

    return 0;
}