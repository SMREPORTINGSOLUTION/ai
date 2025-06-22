"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertTriangle, Shield, Scale, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E0C38] via-[#4D0C3E] to-[#C71852] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => router.push("/")}
              className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contest
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#C71852]" />
            Terms & Conditions
          </h1>
          <p className="text-gray-200">Please read these terms carefully before participating in our contests</p>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 bg-red-500/20 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">IMPORTANT DISCLAIMER</h3>
                <p className="text-red-200">
                  This contest is fully participated by users at their own risk. By entering this contest, you
                  acknowledge that you understand and accept all risks associated with participation. Please take these
                  terms seriously and only participate if you fully understand and agree to all conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Contest Rules */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C71852]" />
                Contest Rules & Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-200 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Daily Contest Sessions</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Three (3) contest sessions are conducted daily</li>
                  <li>Morning Session: 8:00 AM</li>
                  <li>Afternoon Session: 2:00 PM</li>
                  <li>Evening Session: 8:00 PM</li>
                  <li>Each session accepts up to 10 lakh (1,000,000) participants</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Prize Distribution Structure</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>10 lakh+ participants:</strong> 10 iPhone 15 devices will be distributed
                  </li>
                  <li>
                    <strong>5 lakh+ participants:</strong> 5 iPhone 15 devices will be distributed
                  </li>
                  <li>
                    <strong>2.5 lakh+ participants:</strong> 3 iPhone 15 devices will be distributed
                  </li>
                  <li>
                    <strong>1 lakh+ participants:</strong> 2 iPhone 15 devices will be distributed
                  </li>
                  <li>
                    <strong>50,000+ participants:</strong> 1 iPhone 15 device will be distributed
                  </li>
                  <li>
                    <strong>Less than 50,000 participants:</strong> No prizes will be distributed for that session
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Entry Requirements</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Entry fee: ₹10 per contest session</li>
                  <li>Payment must be completed via UPI</li>
                  <li>One entry per person per session</li>
                  <li>Valid email and phone number required</li>
                  <li>Must be 18+ years old to participate</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Participation Limits</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maximum 10 lakh (1,000,000) participants per session</li>
                  <li>Sessions may close early if maximum capacity is reached</li>
                  <li>First-come, first-served basis for entry acceptance</li>
                  <li>No refunds if session becomes full after payment</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Participation Risks */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Participation Risks & User Responsibility
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-200 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Financial Risk</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Entry fees are non-refundable once payment is completed</li>
                  <li>No guarantee of winning any prize</li>
                  <li>Participants may lose their entry fee without receiving any prize</li>
                  <li>Only participate with money you can afford to lose</li>
                  <li>With up to 10 lakh participants per session, winning odds are extremely low</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Contest Risks</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Contests may be cancelled if minimum participants (50,000) are not reached</li>
                  <li>Technical issues may affect contest operations</li>
                  <li>Prize distribution depends on total participant count</li>
                  <li>Winners are selected through random selection process</li>
                  <li>Sessions may reach maximum capacity (10 lakh) and close unexpectedly</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Odds and Probability</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>With maximum 10 lakh participants and maximum 10 prizes, odds are 1 in 100,000 at best</li>
                  <li>Actual odds may be much lower depending on participant count and prize tier</li>
                  <li>This is primarily a game of chance with very low probability of winning</li>
                  <li>Most participants will not win any prize</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">User Acknowledgment</h4>
                <p className="text-red-200 font-semibold">By participating, you explicitly acknowledge that:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>You understand this is a game of chance with extremely low winning odds</li>
                  <li>You are participating entirely at your own risk</li>
                  <li>You will not hold the organizers liable for any losses</li>
                  <li>You have read and understood all terms and conditions</li>
                  <li>You are participating voluntarily and of your own free will</li>
                  <li>You understand that with up to 10 lakh participants, your chances of winning are minimal</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Winner Selection */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Winner Selection & Prize Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-200 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Selection Process</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Winners are selected randomly using cryptographically secure methods</li>
                  <li>Selection occurs after each contest session ends</li>
                  <li>All eligible participants have equal chances of winning</li>
                  <li>Winner selection is final and cannot be contested</li>
                  <li>Number of winners depends on total participant count as per prize structure</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Prize Tiers and Distribution</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>10 lakh+ participants: 10 iPhone 15 devices distributed</li>
                  <li>5 lakh+ participants: 5 iPhone 15 devices distributed</li>
                  <li>2.5 lakh+ participants: 3 iPhone 15 devices distributed</li>
                  <li>1 lakh+ participants: 2 iPhone 15 devices distributed</li>
                  <li>50,000+ participants: 1 iPhone 15 device distributed</li>
                  <li>Less than 50,000 participants: No prizes distributed, entry fees retained</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Prize Delivery</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Winners will be notified via email within 24 hours</li>
                  <li>Prize delivery is free worldwide</li>
                  <li>Delivery timeframe: 7-14 business days</li>
                  <li>Winners must provide valid shipping address</li>
                  <li>Prizes cannot be exchanged for cash</li>
                  <li>Unclaimed prizes within 30 days will be forfeited</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Legal & Compliance */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Legal Terms & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-200 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Limitation of Liability</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Organizers are not liable for any financial losses</li>
                  <li>No compensation for technical issues or delays</li>
                  <li>Participants waive all claims against organizers</li>
                  <li>Maximum liability limited to entry fee amount (₹10)</li>
                  <li>No liability for sessions that don't meet minimum participant requirements</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Session Capacity and Fairness</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Sessions may close without notice when 10 lakh capacity is reached</li>
                  <li>Entry acceptance is on first-come, first-served basis</li>
                  <li>No refunds for sessions that become full after payment processing</li>
                  <li>Technical delays may affect entry processing order</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Data & Privacy</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Personal information used only for contest purposes</li>
                  <li>Winner names may be published for transparency</li>
                  <li>Payment information is processed securely</li>
                  <li>Data retention as per applicable laws</li>
                  <li>Participant statistics may be shared publicly</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Modifications & Termination</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Terms may be updated without prior notice</li>
                  <li>Contest may be suspended or terminated at any time</li>
                  <li>Prize structure may be modified based on participation levels</li>
                  <li>Continued participation implies acceptance of updated terms</li>
                  <li>Disputes subject to local jurisdiction</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Final Warning */}
          <Card className="bg-orange-500/20 border-orange-500/30">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-orange-400 mb-4">FINAL WARNING</h3>
                <p className="text-orange-200 mb-4">
                  This contest involves significant financial risk with extremely low winning odds. Only participate if
                  you:
                </p>
                <ul className="text-orange-200 text-left max-w-md mx-auto space-y-2">
                  <li>• Can afford to lose the entry fee</li>
                  <li>• Understand this is a game of chance with odds as low as 1 in 1,000,000</li>
                  <li>• Accept full responsibility for your participation</li>
                  <li>• Are participating for entertainment purposes only</li>
                  <li>• Understand that most participants will not win</li>
                </ul>
                <p className="text-orange-300 font-semibold mt-4">
                  DO NOT PARTICIPATE IF YOU CANNOT AFFORD TO LOSE YOUR ENTRY FEE
                </p>
                <p className="text-red-300 font-bold mt-2">
                  WITH UP TO 10 LAKH PARTICIPANTS, YOUR CHANCES OF WINNING ARE EXTREMELY LOW
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Agreement */}
          <Card className="bg-green-500/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Agreement Confirmation</h3>
              <p className="text-green-200 mb-4">
                By clicking "Enter Contest" on our main page, you confirm that you have read, understood, and agree to
                all the terms and conditions stated above, including the updated prize structure and participant limits.
              </p>
              <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700 text-white">
                I Understand - Return to Contest
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-300 text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>Updated to reflect new prize structure and 10 lakh participant capacity.</p>
          <p>For questions or concerns, please contact our support team.</p>
        </div>
      </div>
    </div>
  )
}
