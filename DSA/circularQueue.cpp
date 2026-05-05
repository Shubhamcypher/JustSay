#include <iostream>

using namespace std;

class circularQueue{
    int* arr;
    int currSize, cap;
    int f;
    int r;

    public:
    circularQueue(int size){
        cap = size;
        arr = new int[cap];
        f=0;
        r=-1;
        currSize = 0;
    }

    void push(int val){
        if(currSize == cap){
            cout << "Can not push circular queue is full";
            return;
        }

        r = (r+1)%cap;
        arr[r]=val;
        currSize++;
    }

    void pop(){
        if(currSize == 0){
            cout << "Circular queue is empty";
            return;
        }

        f = (f+1)%cap;
        currSize--;
    }

    int front(){
        if(currSize == 0)
        return -1;
        return arr[f];
    }

    bool empty(){
        return currSize == 0;
    }
};

int main(){
    circularQueue cq(3);

    cq.push(1);
    cq.push(2);
    cq.push(3);
    cq.pop();
    cq.push(4);

    while(!cq.empty()){
        cout << cq.front() << " ";
        cq.pop();
    }
}