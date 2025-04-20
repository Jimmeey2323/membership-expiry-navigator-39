
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { MembershipRecord, FollowUp } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from './ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Input } from './ui/input';

interface MembershipModalProps {
  record: MembershipRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedRecord: MembershipRecord) => void;
}

const MembershipModal: React.FC<MembershipModalProps> = ({
  record,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [assignedTo, setAssignedTo] = useState<string>(record?.assignedTo || '');
  const [newFollowup, setNewFollowup] = useState<{ date: string; comment: string }>({
    date: format(new Date(), 'yyyy-MM-dd'),
    comment: ''
  });
  
  if (!record) return null;
  
  const handleSaveAssignment = () => {
    const updatedRecord = {
      ...record,
      assignedTo
    };
    
    onUpdate(updatedRecord);
    toast({
      title: "Assignment saved",
      description: `${record.customerName} assigned to ${assignedTo || 'no one'}.`
    });
  };
  
  const handleAddFollowup = () => {
    if (!newFollowup.comment.trim()) {
      toast({
        title: "Cannot add follow-up",
        description: "Please enter a comment.",
        variant: "destructive"
      });
      return;
    }
    
    const followUp: FollowUp = {
      id: uuidv4(),
      date: newFollowup.date,
      comment: newFollowup.comment,
      createdAt: new Date().toISOString()
    };
    
    const updatedRecord = {
      ...record,
      followUps: [...(record.followUps || []), followUp]
    };
    
    onUpdate(updatedRecord);
    setNewFollowup({
      date: format(new Date(), 'yyyy-MM-dd'),
      comment: ''
    });
    
    toast({
      title: "Follow-up added",
      description: "New follow-up task has been added."
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{record.customerName}</span>
            <div className="flex gap-2">
              {record.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Membership Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{record.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Membership</p>
                    <p className="font-medium">{record.membershipName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Home Location</p>
                    <p className="font-medium">{record.homeLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{record.assignedTo || 'Not Assigned'}</p>
                  </div>
                </div>
                
                {record.expiresAt && (
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Expiration Details</h3>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Expires At</p>
                          <p className="font-medium">{new Date(record.expiresAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Days Lapsed</p>
                          <p className={`font-medium ${
                            record.daysLapsed && record.daysLapsed > 0 
                              ? 'text-destructive' 
                              : 'text-green-600'
                          }`}>
                            {record.daysLapsed !== undefined 
                              ? record.daysLapsed >= 0 
                                ? `${record.daysLapsed} days ago` 
                                : `In ${Math.abs(record.daysLapsed)} days`
                              : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignment" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assign Membership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Assign to Associate</p>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an associate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      <SelectItem value="Admin Admin">Admin Admin</SelectItem>
                      <SelectItem value="Akshay Rane">Akshay Rane</SelectItem>
                      <SelectItem value="Api Serou">Api Serou</SelectItem>
                      <SelectItem value="Imran Shaikh">Imran Shaikh</SelectItem>
                      <SelectItem value="Jayanta Banerjee">Jayanta Banerjee</SelectItem>
                      <SelectItem value="Manisha Rathod">Manisha Rathod</SelectItem>
                      <SelectItem value="Prathap Kp">Prathap Kp</SelectItem>
                      <SelectItem value="Priyanka Abnave">Priyanka Abnave</SelectItem>
                      <SelectItem value="Santhosh Kumar">Santhosh Kumar</SelectItem>
                      <SelectItem value="Sheetal Kataria">Sheetal Kataria</SelectItem>
                      <SelectItem value="Shipra Bhika">Shipra Bhika</SelectItem>
                      <SelectItem value="Tahira Sayyed">Tahira Sayyed</SelectItem>
                      <SelectItem value="Zahur Shaikh">Zahur Shaikh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveAssignment}>Save Assignment</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="followups" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Follow-ups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!record.followUps || record.followUps.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No follow-ups yet</p>
                )}
                
                {record.followUps && record.followUps.length > 0 && (
                  <div className="space-y-3">
                    {record.followUps.map((followUp) => (
                      <div key={followUp.id} className="bg-muted/30 p-3 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{new Date(followUp.date).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(followUp.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <p className="mt-1 text-sm">{followUp.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-4 space-y-3 border-t">
                  <h3 className="text-sm font-medium">Add New Follow-up</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date</p>
                      <Input
                        type="date"
                        value={newFollowup.date}
                        onChange={(e) => setNewFollowup({ ...newFollowup, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Comment</p>
                      <Textarea 
                        value={newFollowup.comment}
                        onChange={(e) => setNewFollowup({ ...newFollowup, comment: e.target.value })}
                        placeholder="Enter details about this follow-up..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleAddFollowup}>Add Follow-up</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipModal;
