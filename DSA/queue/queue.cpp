#include <iostream>
#include <queue>
#include <deque>

using namespace std;


class Node{
    public:
    int data;
    Node* next;

    Node(int val){
        data = val;
        next = NULL;
    }
};

class Queue{
    Node* head;
    Node* tail;

    public:

    Queue(){
        head = tail = NULL;
    }

    void push(int data){
        Node* newNode = new Node(data);

        if(head == NULL)
        head = tail = newNode;
        else{
            tail->next = newNode;
            tail = newNode;
        }
    }


    void pop(){
        if(head == NULL){
            cout << "Can not pop, queue is empty";
            return;
        }

        else if(head == tail){
            delete(head);
            head = NULL;
            tail = NULL;
        }
        else{
            Node* temp = head;
            head =  head->next;
            delete(temp);
        }
    }

    int front(){
        if(head == NULL) return -1;
        return head->data;
    }

    bool empty(){
        return head == NULL;
    }
};


int main(){
    queue<int>q;
    deque<int>dq;
    // Queue q;

    // q.push(1);
    // q.push(2);
    // q.push(3);
    // q.push(3);
    // q.push(3);

    // while(!q.empty()){
    //     cout<< q.front() << " ";
    //     q.pop();
    // }

    dq.push_front(4);
    dq.push_front(3);
    dq.push_front(2);
    dq.push_front(1);
    dq.push_back(5);
    dq.push_back(6);

    while(!dq.empty()){
        cout<< dq.front() << " ";
        dq.pop_front();
        // cout<< dq.back() << " "; //6 5 4 3 2 1 with pop back
    }
}
